package audio.business.sound.voice;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProfileValidatorTest {
    private final ProfileValidator validator = new ProfileValidator();

    @Test void extractsTemplateAndAliases() {
        var result = validator.validate("Моя специальность бэкенд-разработчик. Стек джава, постгрес, докер. Стаж от одного до двух лет. Желаемая должность Junior Java-разработчик.");
        assertEquals("Веб-разработка", result.sphere());
        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Java", "PostgreSQL", "Docker"), result.skills());
        assertEquals(12, result.experience().minMonths());
        assertEquals(24, result.experience().maxMonths());
        assertEquals("Junior Java-разработчик", result.desiredPosition());
        assertTrue(result.issues().isEmpty(), result.issues().toString());
        assertTrue(result.requiresConfirmation());
    }

    @Test void separatesOverlappingNamesAndDesiredPosition() {
        var result = validator.validate("Специальность фронтенд. Технологии JavaScript, GitHub, C#, C++. Опыт 6 месяцев. Ищу бэкенд-разработчик.");
        assertEquals("Фронтенд-разработчик", result.specialization());
        assertEquals(List.of("JavaScript", "C#", "C++", "GitHub"), result.skills());
        assertEquals(6, result.experience().minMonths());
        assertTrue(result.unknownSkills().isEmpty());
    }

    @Test void handlesNoExperienceAndUnknownTechnology() {
        var result = validator.validate("Специальность девопс. Стек докер, питон, суперлиба. Стаж без опыта. Ищу стажировку.");
        assertEquals(0, result.experience().minMonths());
        assertEquals(List.of("суперлиба"), result.unknownSkills());
        assertTrue(result.issues().contains("UNKNOWN_SKILLS"));
    }

    @Test void suggestsButDoesNotGuess() {
        var result = validator.validate("Специальность бэкенд. Стек pythom. Стаж два года. Ищу стажировку.");
        assertTrue(result.skills().isEmpty());
        assertTrue(result.issues().stream().anyMatch(s -> s.contains("Python")));
    }

    @Test void ambiguousRolesAndInvalidRangesNeedReview() {
        var result = validator.validate("Специальность фронтенд и бэкенд. Стек SQL. Стаж три-два года. Ищу разработчика.");
        assertNull(result.specialization());
        assertNull(result.experience());
        assertTrue(result.issues().contains("SPECIALIZATION_AMBIGUOUS"));
    }

    @Test void sumsYearsAndMonths() {
        assertEquals(30, validator.validate("Стаж два года шесть месяцев").experience().minMonths());
        assertEquals(18, validator.validate("Стаж полтора года").experience().minMonths());
        assertNull(validator.validate("Стаж около двух лет").experience());
    }

    @Test void missingMarkersDoNotGuessFromNarrative() {
        var result = validator.validate("Я работал с Java и хочу стать разработчиком");
        assertNull(result.specialization());
        assertTrue(result.skills().isEmpty());
        assertTrue(result.issues().contains("TEMPLATE_MARKERS_MISSING"));
    }

    @Test void doesNotAcceptNegativeDecimalOrHugeExperience() {
        for (String value : List.of("-2 года", "1.5 года", "999999999999 лет", "2147483647 лет", "2 года 3 года"))
            assertNull(validator.validate("Стаж " + value).experience(), value);
    }

    @Test void flagsNegationAndRepeatedSections() {
        var result = validator.validate("Специальность бэкенд. Стек не Java. Стек Docker. Стаж год. Ищу стажировку.");
        assertTrue(result.issues().contains("NEGATION_REQUIRES_REVIEW"));
        assertTrue(result.issues().contains("REPEATED_SECTION: skills"));
    }

    @Test void pipelineUsesTheTranscriberWithoutConsole() throws Exception {
        var service = new VoiceProfileService(path -> "Специальность бэкенд. Стек Python. Стаж полгода. Ищу стажировку.", validator);
        assertEquals(6, service.extract(java.nio.file.Path.of("test.wav")).experience().minMonths());
    }

    @Test void prefersFullTechnologyNamesOverOverlappingAliases() {
        var result = validator.validate("Стек Node.js, React Native, GitLab CI/CD. Стаж год.");
        assertEquals(List.of("Node.js", "React Native", "GitLab CI/CD"), result.skills());
        assertTrue(result.unknownSkills().isEmpty());
    }

    @Test void handlesWhisperMarkerErrorsAndRemovesTrailingHallucination() {
        var result = validator.validate("моя специальность backend разработчик мой стек Java, Python, Spring Boot, PostgreSQL, Docker и Git мой сташ два года желаемой должности Java разработчи С вами был Игорь Негода.");

        assertEquals("Веб-разработка", result.sphere());
        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Python", "Java", "Spring Boot", "PostgreSQL", "Docker", "Git"), result.skills());
        assertEquals(24, result.experience().minMonths());
        assertEquals(24, result.experience().maxMonths());
        assertEquals("Java разработчи", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty());
        assertFalse(result.transcript().contains("Игорь Негода"));
        assertTrue(result.issues().contains("TRAILING_HALLUCINATION_REMOVED"));
    }

    @Test void acceptsDeclinedSectionMarkers() {
        var result = validator.validate("По моей специальности бэкенд. В моём стеке Java. Моего стажа два года. О желаемой позиции Java-разработчика.");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Java"), result.skills());
        assertEquals(24, result.experience().minMonths());
        assertEquals("Java-разработчика", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty());
    }

    @Test void handlesRealWhisperTechnologyDistortions() {
        var result = validator.validate("Специальность бек-энд разработчик. Мой стек. Джава, Пайтон, Спринбут, Котлин, Позгры, Эсквилл, Докер и Гит. Мой стаж. Два года. Желаемая должность, Джава разработчик");

        assertEquals("Веб-разработка", result.sphere());
        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Python", "Java", "Kotlin", "SQL", "Spring Boot", "PostgreSQL", "Docker", "Git"), result.skills());
        assertEquals(24, result.experience().minMonths());
        assertEquals("Java разработчик", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty());
        assertTrue(result.issues().isEmpty(), result.issues().toString());
    }
}
