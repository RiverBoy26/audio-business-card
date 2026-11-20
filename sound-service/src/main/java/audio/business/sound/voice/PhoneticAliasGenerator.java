package audio.business.sound.voice;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Produces conservative Cyrillic ASR variants for an explicitly curated pronunciation.
 *
 * <p>The generator deliberately performs at most one sound mutation. Larger distortions
 * belong in the observed aliases in {@code skills.tsv}; accepting arbitrary fuzzy matches
 * would make short technology names collide.</p>
 */
final class PhoneticAliasGenerator {
    private static final List<String> VOWEL_GROUPS = List.of("ао", "еиэ", "иы");
    private static final List<String> CONSONANT_GROUPS = List.of("бп", "вф", "гк", "дт", "жш", "зс");

    private PhoneticAliasGenerator() {}

    static Set<String> variants(String source) {
        String normalized = normalize(source);
        if (!isEligible(normalized)) return Set.of();

        LinkedHashSet<String> layouts = new LinkedHashSet<>();
        layouts.add(normalized);
        if (normalized.indexOf(' ') >= 0 || normalized.indexOf('-') >= 0) {
            String spaced = normalized.replace('-', ' ').replaceAll("\\s+", " ").trim();
            layouts.add(spaced);
            layouts.add(spaced.replace(' ', '-'));
            layouts.add(spaced.replace(" ", ""));
        }

        LinkedHashSet<String> result = new LinkedHashSet<>(layouts);
        for (String layout : layouts) {
            if (cyrillicLetterCount(layout) < 5) continue;
            addSingleCharacterAlternatives(result, layout, VOWEL_GROUPS);
            addSingleCharacterAlternatives(result, layout, CONSONANT_GROUPS);
            addSoftSoundAlternatives(result, layout);
            addSequenceAlternatives(result, layout);
        }
        result.remove(normalized);
        return Set.copyOf(result);
    }

    private static void addSingleCharacterAlternatives(Set<String> target, String value, List<String> groups) {
        for (int index = 0; index < value.length(); index++) {
            char current = value.charAt(index);
            for (String group : groups) {
                if (group.indexOf(current) < 0) continue;
                for (int replacement = 0; replacement < group.length(); replacement++) {
                    char candidate = group.charAt(replacement);
                    if (candidate != current) target.add(replace(value, index, candidate));
                }
            }
        }
    }

    private static void addSoftSoundAlternatives(Set<String> target, String value) {
        for (int index = 0; index < value.length(); index++) {
            char current = value.charAt(index);
            if ((current == 'ь' || current == 'й') && value.length() > 4)
                target.add(value.substring(0, index) + value.substring(index + 1));
        }
    }

    private static void addSequenceAlternatives(Set<String> target, String value) {
        addBidirectionalReplacement(target, value, "дж", "ж");
        addBidirectionalReplacement(target, value, "тс", "ц");
        addBidirectionalReplacement(target, value, "кс", "кз");
    }

    private static void addBidirectionalReplacement(Set<String> target, String value, String left, String right) {
        addOneSequenceReplacement(target, value, left, right);
        addOneSequenceReplacement(target, value, right, left);
    }

    private static void addOneSequenceReplacement(Set<String> target, String value, String source, String replacement) {
        int start = value.indexOf(source);
        while (start >= 0) {
            target.add(value.substring(0, start) + replacement + value.substring(start + source.length()));
            start = value.indexOf(source, start + 1);
        }
    }

    private static String replace(String value, int index, char replacement) {
        char[] chars = value.toCharArray();
        chars[index] = replacement;
        return new String(chars);
    }

    private static boolean isEligible(String value) {
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            if (!isCyrillic(character) && character != ' ' && character != '-') return false;
        }
        return cyrillicLetterCount(value) >= 4;
    }

    private static int cyrillicLetterCount(String value) {
        int letters = 0;
        for (int index = 0; index < value.length(); index++)
            if (isCyrillic(value.charAt(index))) letters++;
        return letters;
    }

    private static boolean isCyrillic(char character) {
        return character >= 'а' && character <= 'я';
    }

    private static String normalize(String value) {
        return value.toLowerCase(Locale.ROOT).replace('ё', 'е').replaceAll("\\s+", " ").trim();
    }
}
