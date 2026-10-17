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
        var result = validator.validate("Я раньше писал разные программы");
        assertNull(result.specialization());
        assertTrue(result.skills().isEmpty());
        assertTrue(result.issues().contains("TEMPLATE_MARKERS_MISSING"));
    }

    @Test void doesNotAcceptNegativeDecimalOrHugeExperience() {
        for (String value : List.of("-2 года", "1.3 года", "999999999999 лет", "2147483647 лет", "2 года 3 года"))
            assertNull(validator.validate("Стаж " + value).experience(), value);
        assertEquals(18, validator.validate("Стаж 1,5 года").experience().minMonths());
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

    @Test void recoversSpecializationFromJoinedPronounAndNoise() {
        var result = validator.validate("Да, я ябекенд baggage разработчик. В работе использую Java. Опыт работы два года. Хочу работать Java-разработчиком.");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Java"), result.skills());
    }

    @Test void handlesFrontendWhisperDistortions() {
        var result = validator.validate("Мой специальный фронтенд разработчик. Мой стек. Жела скрипт. Тайп скрипт. Реакт. Реакт Нейтив. Гит. Гит хам. Гит лап.");

        assertEquals("Фронтенд-разработчик", result.specialization());
        assertEquals(List.of("JavaScript", "TypeScript", "React", "React Native", "Git", "GitHub", "GitLab"), result.skills());
        assertTrue(result.unknownSkills().isEmpty());
    }

    @Test void handlesDevOpsWhisperDistortions() {
        var result = validator.validate("Пециализация DevOps Engineer. Использую Linux, Bash, Docker, Abermetz.");

        assertEquals("DevOps-инженер", result.specialization());
        assertEquals(List.of("Linux", "Bash", "Docker", "Kubernetes"), result.skills());
        assertTrue(result.unknownSkills().isEmpty());
    }

    @Test void handlesBackendAndFastApiWhisperDistortions() {
        var result = validator.validate("ICA специальность бэкэнт разработчик. Мой навык. Python, FastAP, PostgreSQL и технология Super Framework.");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Python", "FastAPI", "PostgreSQL"), result.skills());
        assertTrue(result.unknownSkills().stream().anyMatch(value -> value.contains("super framework")));
    }

    @Test void keepsDistortedFrontendAndBackendAmbiguous() {
        var result = validator.validate("Специальность фронт-энтр-зарабочек и бек-энтр-зарабочек. Мой стек. Жела-скрипт. Реакт. Жела и Spring Boot.");

        assertNull(result.specialization());
        assertTrue(result.issues().contains("SPECIALIZATION_AMBIGUOUS"));
        assertEquals(List.of("JavaScript", "Java", "React", "Spring Boot"), result.skills());
    }

    @Test void recognizesBpmAsBpmn() {
        var result = validator.validate("Моей специализации я системный аналитик. Моих навыков BPM, UML.");

        assertEquals("Системный аналитик", result.specialization());
        assertEquals(List.of("BPMN", "UML"), result.skills());
        assertTrue(result.unknownSkills().isEmpty());
    }

    @Test void extractsNaturalSpeechWithOneSpecialization() {
        var result = validator.validate("Я бэкенд-разработчик. Работаю с Java, Spring Boot, PostgreSQL и Docker. Опыт работы два года и шесть месяцев. Хочу работать Middle Java-разработчиком.");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Java", "Spring Boot", "PostgreSQL", "Docker"), result.skills());
        assertEquals(30, result.experience().minMonths());
        assertEquals("Middle Java-разработчиком", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
        assertTrue(result.issues().isEmpty(), result.issues().toString());
    }

    @Test void excludesExplicitlyNegatedSkillAndUnderstandsRecentDistortions() {
        var result = validator.validate("Я бэкенд-разработчик. Мой стек не Java, а Пайтон, Джанга, Спрингбуд, Постгрызг ол и Гид. Стаж 1,5 года. Ищу работу Python-разработчиком.");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Python", "Django", "Spring Boot", "PostgreSQL", "Git"), result.skills());
        assertEquals(18, result.experience().minMonths());
        assertEquals("Python-разработчиком", result.desiredPosition());
        assertTrue(result.issues().contains("NEGATION_REQUIRES_REVIEW"));
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void handlesGigaAmBackendPhonetics() {
        var result = validator.validate("я бэк энд разработчик я в работе использую джаво спринбуд посгресс кьюн редис докер и гид опыт работы два года и шесть месяцев хочу работать мидл джава разработчиком");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Java", "Spring Boot", "PostgreSQL", "Redis", "Docker", "Git"), result.skills());
        assertEquals(30, result.experience().minMonths());
        assertEquals("Middle Java разработчиком", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void handlesGigaAmFrontendPhoneticsAndVerboseRange() {
        var result = validator.validate("я фронтенд разработчик работаю с джаво скрипт тайпскрипт реакт реактнейтив гитхаб и гит лаб мой опыт от одного года до трех лет ищу работу фронтенд разработчиком");

        assertEquals("Фронтенд-разработчик", result.specialization());
        assertEquals(List.of("JavaScript", "TypeScript", "React", "React Native", "GitHub", "GitLab"), result.skills());
        assertEquals(12, result.experience().minMonths());
        assertEquals(36, result.experience().maxMonths());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void handlesGigaAmDevOpsPhoneticsAndMarkerError() {
        var result = validator.validate("я девопс инженер используй линукс баш докер кабернатс энгеингс гитлаб сиайсиди ансайбл и тераформ опыт работы три года и семь месяцев хочу работать в сеньор девопс инженером");

        assertEquals("DevOps-инженер", result.specialization());
        assertEquals(List.of("Linux", "Bash", "Docker", "Kubernetes", "Nginx", "GitLab CI/CD", "Ansible", "Terraform"), result.skills());
        assertEquals(43, result.experience().minMonths());
        assertEquals("Senior девопс инженером", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void handlesGigaAmNegationAndBackendError() {
        var result = validator.validate("я пекенд разработчик работаю не с жало а с пайтон джанго фаст афи и постгр эс кьюэль мой стаж полтора года хочу работать пайтен разработчиком");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Python", "FastAPI", "Django", "PostgreSQL"), result.skills());
        assertEquals(18, result.experience().minMonths());
        assertEquals("Python разработчиком", result.desiredPosition());
        assertTrue(result.issues().contains("NEGATION_REQUIRES_REVIEW"));
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void handlesLongGigaAmTechnologyList() {
        var result = validator.validate("я бэк энд разработчик работаю с джаво джаво скрипт тайпскрипт пайтон котлин си шарп си плюс плюс эскюэль спрингбуд фаст апи джанго реакт нейтив нот джей эс озгресс май эскюэль редис линукс баш докер");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Kotlin", "SQL",
                "FastAPI", "Django", "Spring Boot", "Node.js", "React Native", "PostgreSQL", "MySQL",
                "Redis", "Linux", "Bash", "Docker"), result.skills());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void generatesConservativePhoneticSkillVariants() {
        var result = validator.validate("Я бэкенд-разработчик. Работаю с жаво, спринг-бут, посткрес и редиз. Стаж год. Ищу Java-разработчика.");

        assertEquals(List.of("Java", "Spring Boot", "PostgreSQL", "Redis"), result.skills());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void understandsJoinedAndHyphenatedPronunciations() {
        var result = validator.validate("Специальность фронтенд. Стек тайп-скрипт, реакт-нейтив и гит-хаб. Стаж год. Ищу фронтенд-разработчика.");

        assertEquals(List.of("TypeScript", "React Native", "GitHub"), result.skills());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void phoneticExpansionDoesNotTurnUnrelatedWordsIntoSkills() {
        var result = validator.validate("Специальность бэкенд. Стек суперлиба и редактор. Стаж год. Ищу разработчика.");

        assertTrue(result.skills().isEmpty(), result.skills().toString());
        assertFalse(result.unknownSkills().isEmpty());
    }

    @Test void recognizesRussianPronunciationsAcrossTheSupportedCatalog() {
        var result = validator.validate("Специальность девопс. Стек ангуляр, некст джей эс, дотнет, плейрайт, монго ди би, кликхаус, пайторч, дженкинс, пауэршелл и рэббит эм кью. Стаж два года. Ищу разработчика.");

        assertEquals(List.of("Angular", "Next.js", ".NET", "Playwright", "MongoDB", "ClickHouse",
                "PyTorch", "Jenkins", "PowerShell", "RabbitMQ"), result.skills());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
    }

    @Test void handlesLatestGigaAmBackendOutput() {
        var result = validator.validate("я бэкэнд разработчик в работе использую джао спрингбуд постгрес кюэль редис докер и гид опыт работы два года и шесть месяцев хочу работать мидл джао разработчиком");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Java", "Spring Boot", "PostgreSQL", "Redis", "Docker", "Git"), result.skills());
        assertEquals(30, result.experience().minMonths());
        assertEquals("Middle Java разработчиком", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
        assertTrue(result.issues().isEmpty(), result.issues().toString());
    }

    @Test void extractsAvailableDataFromTruncatedGigaAmOutput() {
        var result = validator.validate("я бык энд разработчик в работе использую джава джава джава скрип джава");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("JavaScript", "Java"), result.skills());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
        assertTrue(result.issues().contains("EXPERIENCE_MISSING_OR_INVALID"));
        assertTrue(result.issues().contains("DESIRED_POSITION_MISSING"));
    }

    @Test void handlesReportedBackendProfileRecording() {
        var result = validator.validate("я бэкенд разработчик мой стек пайтон джао фастерин и котлин хочу стать мидоу джао разработчик");

        assertEquals("Бэкенд-разработчик", result.specialization());
        assertEquals(List.of("Python", "Java", "Kotlin", "FastAPI"), result.skills());
        assertEquals("Middle Java разработчик", result.desiredPosition());
        assertTrue(result.unknownSkills().isEmpty(), result.unknownSkills().toString());
        assertEquals(List.of("EXPERIENCE_MISSING_OR_INVALID"), result.issues());
    }

    @Test void recognizesObserved600mBackendVariants() {
        var result = validator.validate("я бэкенд разработчик работаю с пайтон джава джаваскрипт тайпскрипт сишарп гоу пиэйчпи фаст эпиай джанго спрингбуд эйэсбидо нет кор ноу джэс экспресс нэст джейэс эскюэл постск май эк эскюай мой опыт три года хочу работать мидл джава разработчиком");
        assertTrue(result.skills().containsAll(List.of("Go", "FastAPI", "ASP.NET Core", "Node.js", "NestJS")), result.skills().toString());
        assertEquals(36, result.experience().minMonths());
        assertTrue(result.unknownSkills().stream().anyMatch(x -> x.contains("постск")));
    }

    @Test void recognizesObservedDevOpsVariantsWithoutInventingMissingFields() {
        var result = validator.validate("я девопс инженер работаю с линукс виндоус сервер баш поэршел актив директори докер кубернет энджин икс гет лаб сд гетхаб экшенс дженкингс эндсибл терафор силениум лейрайт сайпресс патест джей юнит пос свагер опен эйпиай де тус эксел свагенефлоуфт айпиайээ фоуного до десяти лет хочу работатьведущи опинженер");
        assertEquals("DevOps-инженер", result.specialization());
        assertTrue(result.skills().containsAll(List.of("PowerShell", "Kubernetes", "Nginx", "GitHub Actions", "Jenkins", "Ansible", "Terraform", "Selenium", "Playwright", "pytest", "OpenAPI")), result.skills().toString());
        assertNull(result.experience());
        assertNull(result.desiredPosition());
    }

    @Test void recoversWorkMarkerFromV3Transcript() {
        var result = validator.validate("я бэкенд разработчик работы с пайт энд джаво джавоскрипт тайпскрипт си шарп гоу пиэйчпи джанго спринг гуд эйспидот ноуджиэс экспресс эскюэл май эскьюэль эскьюла мой опыт три года хочу работать мидл джава разработчиком");
        assertTrue(result.skills().containsAll(List.of("Java", "JavaScript", "TypeScript", "C#", "Go", "PHP", "Django", "Express", "SQL")), result.skills().toString());
        assertEquals(36, result.experience().minMonths());
    }
}
