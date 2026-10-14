package audio.business.sound.voice;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.*;

/** Deterministic extraction: section markers, explicit aliases, conservative typo suggestions. */
public final class ProfileValidator {
    private record Entry(String name, String sphere, List<String> aliases) {}

    private final List<Entry> roles = load("roles.tsv");
    private final List<Entry> skills = load("skills.tsv");
    private static final Pattern MARKER = Pattern.compile(
            "(?iuU)(?<![\\p{L}])(?:"
                    + "(?:по\\s+)?(?:мо(?:я|й|ей|ю)\\s+)?(?:специальност(?:ь|и|ью)|специальн(?:ый|ая|ое)|с?пециализаци(?:я|и|ю|ей)|сфер(?:а|е|у|ой))"
                    + "|(?:по\\s+)?(?:мо(?:я|ей)\\s+)?професси(?:я|и|ю|ей)"
                    + "|(?:(?:в\\s+)?мо(?:й|его|ему|им|[её]м)\\s+)?(?:стек(?:а|у|ом|е)?|технологи(?:и|й|ями|ях)|навык(?:и|ов|ами|ах)?)"
                    + "|использу(?:ю|й)|владею|работаю"
                    + "|(?:мо(?:й|его|ему|им|[её]м)\\s+)(?:стаж(?:а|у|ем|е)?|сташ|опыт(?:а|у|ом|е)?(?: работы)?)"
                    + "|(?:стаж(?:а|у|ем|е)?|сташ|опыт(?: работы)?|опыте|опытом)"
                    + "|желаем(?:ая|ой|ую|ою)\\s+(?:должност(?:ь|и|ью)|позици(?:я|и|ю|ей|е))"
                    + "|ищу(?:\\s+(?:работу|позицию|должность))?|хочу(?:\\s+(?:работать|стать))|рассматриваю(?:\\s+(?:позицию|должность))?)(?![\\p{L}])");
    private static final Pattern TRAILING_HALLUCINATION = Pattern.compile(
            "(?iuU)\\s*(?:[.!?]\\s*)?(?:с вами (?:был|была)|редактор субтитров|субтитры|корректор)\\b.*$");
    private static final Pattern TRAILING_SOUND_LABEL = Pattern.compile(
            "(?iuU)\\s*\\[(?:музыка|аплодисменты|шум)]\\s*$");

    public VoiceProfile validate(String transcript) {
        if (transcript == null || transcript.length() > 10000)
            throw new IllegalArgumentException("Transcript must be non-null and at most 10000 characters");
        List<String> issues = new ArrayList<>();
        String cleanedTranscript = cleanTranscript(transcript, issues);
        String parsingTranscript = normalizeRecognitionErrors(cleanedTranscript);
        Map<String, String> sections = sections(parsingTranscript, issues);
        String roleText = sections.getOrDefault("role", "");
        if (roleText.isBlank()) roleText = sections.getOrDefault("intro", "");
        List<Entry> matchedRoles = matches(roleText, roles);
        Entry role = matchedRoles.size() == 1 ? matchedRoles.get(0) : null;
        if (role == null)
            issues.add(matchedRoles.isEmpty() ? "SPECIALIZATION_MISSING_OR_UNKNOWN" : "SPECIALIZATION_AMBIGUOUS");

        String skillText = sections.getOrDefault("skills", "");
        String positiveSkillText = removeNegatedSkills(skillText);
        List<Entry> matchedSkills = matches(positiveSkillText, skills);
        List<String> unknown = new ArrayList<>();
        String remaining = normalize(positiveSkillText);
        List<String> aliases = matchedSkills.stream().flatMap(e -> e.aliases.stream())
                .sorted(Comparator.comparingInt(String::length).reversed()).toList();
        for (String alias : aliases) remaining = boundary(alias).matcher(remaining).replaceAll(" ");
        remaining = remaining.replaceAll("(?iuU)\\b(?:и|а|с|не|также|ещё|еще|это|я|знаю|использую|владею|технологии|навыки|стек)\\b", " ");
        for (String fragment : remaining.split("[,;\\n]")) {
            String value = fragment.replaceAll("^[\\s:.\\-]+|[\\s:.\\-]+$", "").trim();
            if (!value.isBlank()) {
                unknown.add(value);
                if (value.length() >= 5 && !value.contains(" ")) {
                    List<String> candidates = skills.stream().filter(e -> e.aliases.stream()
                            .anyMatch(a -> a.length() >= 5 && distance(value, a) == 1))
                            .map(Entry::name).distinct().toList();
                    if (!candidates.isEmpty())
                        issues.add("SKILL_SUGGESTION: " + value + " -> " + String.join(", ", candidates));
                }
            }
        }
        if (!unknown.isEmpty()) issues.add("UNKNOWN_SKILLS");
        if (matchedSkills.isEmpty()) issues.add("SKILLS_MISSING_OR_UNKNOWN");

        String experienceText = sections.getOrDefault("experience", "");
        VoiceProfile.Experience experience;
        try { experience = experience(experienceText); }
        catch (NumberFormatException | ArithmeticException e) { experience = null; }
        if (experience == null) issues.add("EXPERIENCE_MISSING_OR_INVALID");

        String position = sections.getOrDefault("position", "").replaceAll("^[\\s:—,.;-]+|[\\s.,;]+$", "").trim();
        if (position.isBlank()) {
            position = null;
            issues.add("DESIRED_POSITION_MISSING");
        } else {
            position = position.replaceFirst("(?iuU)^(?:будет|это|в|на\\s+(?:позицию|должность))\\s+", "").trim();
            position = canonicalizeTechnologies(position);
        }
        if (Pattern.compile("(?iuU)\\b(?:не|кроме|без)\\b").matcher(roleText + " " + skillText).find())
            issues.add("NEGATION_REQUIRES_REVIEW");

        return new VoiceProfile(cleanedTranscript, role == null ? null : role.sphere, role == null ? null : role.name,
                matchedSkills.stream().map(Entry::name).toList(), experience, position,
                List.copyOf(unknown), List.copyOf(issues), true);
    }

    private String canonicalizeTechnologies(String text) {
        String result = text;
        List<Map.Entry<String, String>> aliases = skills.stream()
                .flatMap(entry -> entry.aliases.stream().map(alias -> Map.entry(alias, entry.name)))
                .sorted(Map.Entry.<String, String>comparingByKey(Comparator.comparingInt(String::length).reversed()))
                .toList();
        for (Map.Entry<String, String> alias : aliases) {
            Pattern pattern = Pattern.compile("(?iuU)(?<![\\p{L}\\p{N}+#])" + Pattern.quote(alias.getKey())
                    + "(?![\\p{L}\\p{N}+#])");
            result = pattern.matcher(result).replaceAll(Matcher.quoteReplacement(alias.getValue()));
        }
        return result.replaceAll("(?iuU)(?<![\\p{L}])джуниор(?![\\p{L}])", "Junior")
                .replaceAll("(?iuU)(?<![\\p{L}])мидл(?![\\p{L}])", "Middle")
                .replaceAll("(?iuU)(?<![\\p{L}])сеньор(?![\\p{L}])", "Senior");
    }

    private String removeNegatedSkills(String text) {
        String result = normalize(text);
        List<String> aliases = skills.stream().flatMap(entry -> entry.aliases.stream())
                .sorted(Comparator.comparingInt(String::length).reversed()).toList();
        for (String alias : aliases)
            result = Pattern.compile("(?<![\\p{L}\\p{N}+#])не\\s+(?:с\\s+)?" + Pattern.quote(alias)
                    + "(?![\\p{L}\\p{N}+#])").matcher(result).replaceAll(" ");
        return result;
    }

    private static String cleanTranscript(String transcript, List<String> issues) {
        String cleaned = TRAILING_SOUND_LABEL.matcher(transcript).replaceFirst("").trim();
        Matcher hallucination = TRAILING_HALLUCINATION.matcher(cleaned);
        if (hallucination.find()) {
            cleaned = cleaned.substring(0, hallucination.start()).trim();
            issues.add("TRAILING_HALLUCINATION_REMOVED");
        } else if (!cleaned.equals(transcript.trim())) {
            issues.add("TRAILING_NON_SPEECH_REMOVED");
        }
        return cleaned;
    }

    private static String normalizeRecognitionErrors(String transcript) {
        return transcript
                .replaceAll("(?iuU)\\bя?[бп][еэ]к[-\\s]?[еэ]н[дт]р?\\b", "бэкенд")
                .replaceAll("(?iuU)\\bфронт[-\\s]?[еэ]н[дт]р?\\b", "фронтенд")
                .replaceAll("(?iuU)\\bбез окрутой\\b", "без опыта");
    }

    private static Map<String, String> sections(String text, List<String> issues) {
        Map<String, String> result = new LinkedHashMap<>();
        Matcher matcher = MARKER.matcher(text);
        String key = null;
        int start = 0;
        boolean found = false;
        while (matcher.find()) {
            if (!found && matcher.start() > 0) put(result, "intro", text.substring(0, matcher.start()), issues);
            found = true;
            if (key != null) put(result, key, text.substring(start, matcher.start()), issues);
            String marker = normalize(matcher.group());
            key = marker.contains("должност") || marker.contains("позици") || marker.startsWith("ищу")
                    || marker.startsWith("хочу") || marker.startsWith("рассматриваю") ? "position"
                    : marker.contains("стаж") || marker.contains("сташ") || marker.contains("опыт") ? "experience"
                    : marker.contains("специал") || marker.contains("пециал") || marker.contains("сфер")
                    || marker.contains("професс") ? "role" : "skills";
            start = matcher.end();
        }
        if (key != null) put(result, key, text.substring(start), issues);
        else {
            put(result, "intro", text, issues);
            issues.add("TEMPLATE_MARKERS_MISSING");
        }
        return result;
    }

    private static void put(Map<String, String> result, String key, String value, List<String> issues) {
        if (result.containsKey(key)) issues.add("REPEATED_SECTION: " + key);
        result.merge(key, value, (a, b) -> a + ", " + b);
    }

    private static VoiceProfile.Experience experience(String raw) {
        String text = normalize(raw).replaceAll("^[\\s:—]+|[\\s.,;]+$", "").trim();
        if (text.matches(".*(?:без опыта|нет опыта|отсутствует|не имею опыта).*") )
            return new VoiceProfile.Experience(0, 0, raw.trim());
        if (Pattern.compile("^-\\s*\\d").matcher(text).find()) return null;
        String[] words = {"ноль", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять", "десять", "одиннадцать", "двенадцать"};
        text = text.replaceAll("(?U)\\bодного\\b|\\bодна\\b", "1")
                .replaceAll("(?U)\\bдвух\\b|\\bдве\\b", "2")
                .replaceAll("(?U)\\bтрех\\b", "3");
        if (text.contains("полтора года")) text = text.replace("полтора года", "18 месяцев");
        if (text.contains("полгода")) text = text.replace("полгода", "6 месяцев");
        for (int i = 0; i < words.length; i++)
            text = text.replaceAll("(?U)\\b" + words[i] + "(?U)\\b", String.valueOf(i));

        Matcher decimalYears = Pattern.compile("(\\d+)[.,](\\d+)\\s*(лет|год(?:а)?)").matcher(text);
        if (decimalYears.find()) {
            BigDecimal months = new BigDecimal(decimalYears.group(1) + "." + decimalYears.group(2))
                    .multiply(BigDecimal.valueOf(12));
            try {
                int value = months.intValueExact();
                if (decimalYears.find() || value < 0 || value > 720) return null;
                return new VoiceProfile.Experience(value, value, raw.trim());
            } catch (ArithmeticException e) {
                return null;
            }
        }

        Matcher range = Pattern.compile("(?:от\\s+)?(\\d+)\\s*(?:-|–|—|до)\\s*(\\d+)\\s*(лет|год(?:а)?|месяц(?:а|ев)?)").matcher(text);
        if (range.find()) {
            int multiplier = range.group(3).startsWith("месяц") ? 1 : 12;
            int min = Math.multiplyExact(Integer.parseInt(range.group(1)), multiplier);
            int max = Math.multiplyExact(Integer.parseInt(range.group(2)), multiplier);
            if (range.find() || min > max || max > 720) return null;
            return new VoiceProfile.Experience(min, max, raw.trim());
        }

        Matcher verboseRange = Pattern.compile("(?:от\\s+)?(\\d+)\\s*(лет|год(?:а)?|месяц(?:а|ев)?)\\s+до\\s+(\\d+)\\s*(лет|год(?:а)?|месяц(?:а|ев)?)").matcher(text);
        if (verboseRange.find()) {
            int minMultiplier = verboseRange.group(2).startsWith("месяц") ? 1 : 12;
            int maxMultiplier = verboseRange.group(4).startsWith("месяц") ? 1 : 12;
            int min = Math.multiplyExact(Integer.parseInt(verboseRange.group(1)), minMultiplier);
            int max = Math.multiplyExact(Integer.parseInt(verboseRange.group(3)), maxMultiplier);
            if (verboseRange.find() || min > max || max > 720) return null;
            return new VoiceProfile.Experience(min, max, raw.trim());
        }

        Matcher units = Pattern.compile("(\\d+)\\s*(лет|год(?:а)?|месяц(?:а|ев)?)").matcher(text);
        int months = 0, count = 0;
        while (units.find()) {
            if (++count > 2) return null;
            months = Math.addExact(months, Math.multiplyExact(Integer.parseInt(units.group(1)),
                    units.group(2).startsWith("месяц") ? 1 : 12));
        }
        if (count == 2 && Pattern.compile("(?iuU)(?:лет|года?|месяц(?:а|ев)?)").matcher(text)
                .results().map(m -> m.group().startsWith("месяц")).distinct().count() < 2) return null;
        if (text.matches(".*(?:\\d+\\s*\\+|минус|от\\s+\\d+).*")) return null;
        if (count == 0 && text.matches("(?U).*\\bгод\\b.*")) { months = 12; count = 1; }
        if (count == 0 || months > 720 || text.matches(".*(?:более|меньше|около|примерно|свыше).*")) return null;
        return new VoiceProfile.Experience(months, months, raw.trim());
    }

    private static List<Entry> matches(String text, List<Entry> catalog) {
        String normalized = normalize(text);
        record Hit(Entry entry, int start, int end) {}
        List<Hit> hits = new ArrayList<>();
        for (Entry entry : catalog) for (String alias : entry.aliases) {
            Matcher matcher = boundary(alias).matcher(normalized);
            while (matcher.find()) hits.add(new Hit(entry, matcher.start(), matcher.end()));
        }
        hits.sort(Comparator.<Hit>comparingInt(h -> h.end - h.start).reversed());
        List<Hit> accepted = new ArrayList<>();
        for (Hit hit : hits) {
            if (accepted.stream().noneMatch(a -> hit.start < a.end && a.start < hit.end)) accepted.add(hit);
        }
        return catalog.stream().filter(e -> accepted.stream().anyMatch(h -> h.entry.equals(e))).toList();
    }

    private static Pattern boundary(String alias) {
        return Pattern.compile("(?<![\\p{L}\\p{N}+#])" + Pattern.quote(alias) + "(?![\\p{L}\\p{N}+#])");
    }

    private static String normalize(String text) {
        return text.toLowerCase(Locale.ROOT).replace('ё', 'е').replaceAll("\\s+", " ").trim();
    }

    private static List<Entry> load(String file) {
        try (InputStream stream = ProfileValidator.class.getResourceAsStream("/voice/" + file)) {
            if (stream == null) throw new IllegalStateException("Missing voice catalog: " + file);
            return new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8)).lines()
                    .filter(s -> !s.isBlank() && !s.startsWith("#")).map(s -> {
                        String[] columns = s.split("\\t", -1);
                        List<String> aliases = new ArrayList<>();
                        aliases.add(normalize(columns[0]));
                        for (String alias : columns[2].split("\\|"))
                            if (!alias.isBlank()) aliases.add(normalize(alias));
                        return new Entry(columns[0], columns[1], List.copyOf(aliases));
                    }).toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static int distance(String a, String b) {
        int[] previous = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) previous[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            int[] current = new int[b.length() + 1];
            current[0] = i;
            for (int j = 1; j <= b.length(); j++)
                current[j] = Math.min(Math.min(current[j - 1] + 1, previous[j] + 1),
                        previous[j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1));
            previous = current;
        }
        return previous[b.length()];
    }
}
