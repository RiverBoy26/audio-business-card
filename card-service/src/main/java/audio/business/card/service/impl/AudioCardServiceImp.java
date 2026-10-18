package audio.business.card.service.impl;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.dto.response.CardPhotoResponse;
import audio.business.card.dto.response.CardDocumentResponse;
import audio.business.card.dto.response.PublicAudioCardResponse;
import audio.business.card.dto.response.PublicMediaResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSettings;
import audio.business.card.entity.CardExperience;
import audio.business.card.mapper.AudioCardMapper;
import audio.business.card.repository.AudioCardRepository;
import audio.business.card.repository.CardExperienceRepository;
import audio.business.card.repository.CardSphereRepository;
import audio.business.card.repository.CardStackRepository;
import audio.business.card.service.interfaces.AudioCardService;
import audio.business.card.service.CardImageStorageService;
import audio.business.card.service.CardDocumentStorageService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
public class AudioCardServiceImp implements AudioCardService {
    private static final String CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String CODE_DIGITS = "23456789";
    private static final String CODE_ALPHABET = CODE_LETTERS + CODE_DIGITS;
    private static final SecureRandom CODE_RANDOM = new SecureRandom();
    private final AudioCardRepository audioCardRepository;
    private final CardExperienceRepository cardExperienceRepository;
    private final CardStackRepository cardStackRepository;
    private final CardSphereRepository cardSphereRepository;
    private final CardImageStorageService imageStorage;
    private final CardDocumentStorageService documentStorage;
    private final RestClient soundClient;

    public AudioCardServiceImp(
            AudioCardRepository audioCardRepository,
            CardExperienceRepository cardExperienceRepository,
            CardStackRepository cardStackRepository,
            CardSphereRepository cardSphereRepository,
            CardImageStorageService imageStorage,
            CardDocumentStorageService documentStorage,
            @Value("${app.sound-service-url:http://localhost:8083}") String soundServiceUrl) {
        this.audioCardRepository = audioCardRepository;
        this.cardExperienceRepository = cardExperienceRepository;
        this.cardStackRepository = cardStackRepository;
        this.cardSphereRepository = cardSphereRepository;
        this.imageStorage = imageStorage;
        this.documentStorage = documentStorage;
        this.soundClient = RestClient.create(soundServiceUrl);
    }

    @Override
    public List<AudioCardResponse> findAllByUserId(UUID userId) {
        return audioCardRepository.findAllByUserId(userId)
                .stream()
                .map(this::ensurePublicCode)
                .map(AudioCardMapper::toResponse)
                .toList();
    }

    @Override
    public AudioCardResponse findById(UUID userId, UUID audioCardId) {
        AudioCard audioCard = audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Аудиовизитка не найдена!"));

        return AudioCardMapper.toResponse(ensurePublicCode(audioCard));
    }

    @Override
    public AudioCardResponse create(UUID userId, AudioCardRequest audioCard) {
        AudioCard card = AudioCardMapper.toEntity(audioCard);
        card.setUserId(userId);
        card.setSkills(normalizeSkills(audioCard.getSkills()));
        card.setMusicId(audioCard.getMusicId());


        CardSettings settings = new CardSettings();
        settings.setAudioCard(card);
        card.setSettings(settings);

        AudioCard saveCard = audioCardRepository.save(card);

        return AudioCardMapper.toResponse(saveCard);
    }

    @Override
    public AudioCardResponse update(UUID userId, UUID audioCardId, AudioCardRequest newAudioCard) {
        AudioCard card = audioCardRepository.findByIdAndUserId(audioCardId, userId).
                orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Аудиовизитка не найдена!"));
        String previousPhotoFilename = null;

        if (newAudioCard.getTitle() != null) {
            card.setTitle(newAudioCard.getTitle());
        }

        if (newAudioCard.getFullName() != null) {
            card.setFullName(newAudioCard.getFullName());
        }

        if (newAudioCard.getContactEmail() != null) {
            card.setContactEmail(newAudioCard.getContactEmail());
        }

        if (newAudioCard.getContactPhone() != null) {
            card.setContactPhone(newAudioCard.getContactPhone());
        }

        if (newAudioCard.getDescription() != null) {
            card.setDescription(newAudioCard.getDescription());
        }

        if (newAudioCard.getPhotoUrl() != null) {
            card.setPhotoUrl(newAudioCard.getPhotoUrl());
            if (isProfileAvatar(card)) {
                previousPhotoFilename = card.getPhotoFilename();
                card.setPhotoFilename(null);
                card.setPhotoContentType(null);
            }
        }

        if (newAudioCard.getSkills() != null) {
            card.setSkills(normalizeSkills(newAudioCard.getSkills()));
        }

        if (newAudioCard.isMusicIdProvided()) {
            card.setMusicId(newAudioCard.getMusicId());
        }
        if (newAudioCard.isVoiceRecordingIdProvided()) {
            card.setVoiceRecordingId(newAudioCard.getVoiceRecordingId());
        }

        if (newAudioCard.getDesiredPosition() != null) {
            card.setDesiredPosition(newAudioCard.getDesiredPosition());
        }

        AudioCard updateCard = audioCardRepository.save(card);
        imageStorage.delete(previousPhotoFilename);

        return AudioCardMapper.toResponse(updateCard);
    }

    @Override
    public AudioCardResponse publish(UUID userId, UUID audioCardId) {
        AudioCard card = findOwnedCard(userId, audioCardId);
        if (card.getTitle() == null || card.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Укажите желаемую должность");
        }
        card.setPublished(true);
        card.setPublishedAt(LocalDateTime.now());
        if (card.getPublicCode() == null) {
            card.setPublicCode(generatePublicCode());
        }
        return AudioCardMapper.toResponse(audioCardRepository.save(card));
    }

    @Override
    public AudioCardResponse unpublish(UUID userId, UUID audioCardId) {
        AudioCard card = findOwnedCard(userId, audioCardId);
        card.setPublished(false);
        card.setPublishedAt(null);
        card.setPublicCode(null);
        return AudioCardMapper.toResponse(audioCardRepository.save(card));
    }

    @Override
    public PublicAudioCardResponse findPublishedById(UUID audioCardId) {
        AudioCard card = ensurePublicCode(findPublishedCard(audioCardId));
        return toPublicResponse(card);
    }

    @Override
    public PublicAudioCardResponse findSharedById(UUID audioCardId) {
        return toPublicResponse(findCard(audioCardId));
    }

    @Override
    public PublicAudioCardResponse findPublishedByCode(String publicCode) {
        String normalizedCode = publicCode == null ? "" : publicCode.trim().toUpperCase(Locale.ROOT);
        if (!normalizedCode.matches("[A-Z0-9]{6}")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Опубликованная визитка не найдена");
        }
        AudioCard card = audioCardRepository.findByPublicCodeAndIsPublishedTrue(normalizedCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Опубликованная визитка не найдена"));
        return toPublicResponse(card);
    }

    private PublicAudioCardResponse toPublicResponse(AudioCard card) {
        PublicAudioCardResponse response = new PublicAudioCardResponse();
        response.setId(card.getId());
        response.setFullName(card.getFullName());
        response.setContactEmail(card.getContactEmail());
        response.setContactPhone(card.getContactPhone());
        response.setTitle(card.getTitle());
        response.setDescription(card.getDescription());
        response.setPhotoUrl(card.getPhotoFilename() == null || isProfileAvatar(card)
                ? card.getPhotoUrl()
                : versionedPhotoUrl("/public/audio-cards/" + card.getId() + "/photo", card.getPhotoFilename()));
        response.setSkills(card.getSkills());
        response.setPublishedAt(card.getPublishedAt());
        response.setPublicCode(card.getPublicCode());
        CardExperience experience = cardExperienceRepository.findByAudioCardId(card.getId()).orElse(null);
        response.setExperienceYears(experience == null ? 0 : experience.getExperienceYears());
        CardSettings settings = card.getSettings();
        response.setVoiceVolume(settings == null ? 100 : settings.getVoiceVolume());
        response.setMusicVolume(settings == null ? 100 : settings.getMusicVolume());
        response.setMusicStartSeconds(settings == null ? 0 : settings.getMusicStartSeconds());
        response.setVoiceUrl(card.getVoiceRecordingId() == null
                ? null
                : "/public/audio-cards/" + card.getId() + "/voice");
        response.setMusicUrl(card.getMusicId() == null
                ? null
                : "/public/audio-cards/" + card.getId() + "/music");
        response.setDocumentName(card.getDocumentOriginalName());
        response.setDocumentUrl(card.getDocumentFilename() == null
                ? null
                : "/public/audio-cards/" + card.getId() + "/document");
        return response;
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID audioCardId) {
        AudioCard card = audioCardRepository
                .findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Аудиовизитка не найдена"
                ));

        String photoFilename = card.getPhotoFilename();
        String documentFilename = card.getDocumentFilename();

        cardStackRepository.deleteAllByAudioCardId(audioCardId);
        cardSphereRepository.deleteAllByAudioCardId(audioCardId);
        cardExperienceRepository.deleteByAudioCardId(audioCardId);
        audioCardRepository.delete(card);
        audioCardRepository.flush();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                imageStorage.delete(photoFilename);
                documentStorage.delete(documentFilename);
            }
        });
    }

    @Override
    public AudioCardResponse uploadPhoto(UUID userId, UUID audioCardId, MultipartFile file) throws IOException {
        AudioCard card = findOwnedCard(userId, audioCardId);
        CardImageStorageService.StoredImage stored = imageStorage.store(file);
        String previous = card.getPhotoFilename();
        try {
            card.setPhotoFilename(stored.filename());
            card.setPhotoContentType(stored.contentType());
            card.setPhotoUrl(versionedPhotoUrl("/audio-cards/" + card.getId() + "/photo", stored.filename()));
            AudioCardResponse response = AudioCardMapper.toResponse(audioCardRepository.save(card));
            imageStorage.delete(previous);
            return response;
        } catch (RuntimeException exception) {
            imageStorage.delete(stored.filename());
            throw exception;
        }
    }

    @Override
    public CardPhotoResponse getPhoto(UUID userId, UUID audioCardId) throws IOException {
        AudioCard card = findOwnedCard(userId, audioCardId);
        if (card.getPhotoFilename() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Фотография не найдена");
        }
        return new CardPhotoResponse(imageStorage.load(card.getPhotoFilename()), card.getPhotoContentType());
    }

    @Override
    public CardPhotoResponse getPublishedPhoto(UUID audioCardId) throws IOException {
        AudioCard card = findPublishedCard(audioCardId);
        if (card.getPhotoFilename() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Фотография не найдена");
        }
        return new CardPhotoResponse(imageStorage.load(card.getPhotoFilename()), card.getPhotoContentType());
    }

    @Override
    public CardPhotoResponse getSharedPhoto(UUID audioCardId) throws IOException {
        AudioCard card = findCard(audioCardId);
        if (card.getPhotoFilename() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Фотография не найдена");
        }
        return new CardPhotoResponse(imageStorage.load(card.getPhotoFilename()), card.getPhotoContentType());
    }

    private String versionedPhotoUrl(String photoUrl, String filename) {
        return photoUrl + "?v=" + filename;
    }

    private boolean isProfileAvatar(AudioCard card) {
        return ("/api/v1/auth/users/" + card.getUserId() + "/avatar").equals(card.getPhotoUrl());
    }

    @Override
    public AudioCardResponse uploadDocument(UUID userId, UUID audioCardId, MultipartFile file) throws IOException {
        AudioCard card = findOwnedCard(userId, audioCardId);
        CardDocumentStorageService.StoredDocument stored = documentStorage.store(file);
        String previous = card.getDocumentFilename();
        try {
            card.setDocumentFilename(stored.filename());
            card.setDocumentOriginalName(stored.originalFilename());
            AudioCardResponse response = AudioCardMapper.toResponse(audioCardRepository.save(card));
            documentStorage.delete(previous);
            return response;
        } catch (RuntimeException exception) {
            documentStorage.delete(stored.filename());
            throw exception;
        }
    }

    @Override
    public CardDocumentResponse getDocument(UUID userId, UUID audioCardId) throws IOException {
        AudioCard card = findOwnedCard(userId, audioCardId);
        return loadDocument(card);
    }

    @Override
    public CardDocumentResponse getPublishedDocument(UUID audioCardId) throws IOException {
        return loadDocument(findPublishedCard(audioCardId));
    }

    @Override
    public CardDocumentResponse getSharedDocument(UUID audioCardId) throws IOException {
        return loadDocument(findCard(audioCardId));
    }

    @Override
    public AudioCardResponse deleteDocument(UUID userId, UUID audioCardId) {
        AudioCard card = findOwnedCard(userId, audioCardId);
        String filename = card.getDocumentFilename();
        card.setDocumentFilename(null);
        card.setDocumentOriginalName(null);
        AudioCardResponse response = AudioCardMapper.toResponse(audioCardRepository.save(card));
        documentStorage.delete(filename);
        return response;
    }

    private CardDocumentResponse loadDocument(AudioCard card) throws IOException {
        if (card.getDocumentFilename() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF-файл не найден");
        }
        return new CardDocumentResponse(
                documentStorage.load(card.getDocumentFilename()),
                MediaType.APPLICATION_PDF_VALUE,
                card.getDocumentOriginalName());
    }

    @Override
    public PublicMediaResponse getPublishedVoice(UUID audioCardId) {
        AudioCard card = findPublishedCard(audioCardId);
        if (card.getVoiceRecordingId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Голосовая заметка не найдена");
        }
        return loadSoundFile("/api/voice-recordings/" + card.getVoiceRecordingId() + "/file", card.getUserId());
    }

    @Override
    public PublicMediaResponse getSharedVoice(UUID audioCardId) {
        AudioCard card = findCard(audioCardId);
        if (card.getVoiceRecordingId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Голосовая заметка не найдена");
        }
        return loadSoundFile("/api/voice-recordings/" + card.getVoiceRecordingId() + "/file", card.getUserId());
    }

    @Override
    public PublicMediaResponse getPublishedMusic(UUID audioCardId) {
        AudioCard card = findPublishedCard(audioCardId);
        if (card.getMusicId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Музыка не найдена");
        }
        return loadSoundFile("/api/music/" + card.getMusicId() + "/file", card.getUserId());
    }

    @Override
    public PublicMediaResponse getSharedMusic(UUID audioCardId) {
        AudioCard card = findCard(audioCardId);
        if (card.getMusicId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Музыка не найдена");
        }
        return loadSoundFile("/api/music/" + card.getMusicId() + "/file", card.getUserId());
    }

    private AudioCard findOwnedCard(UUID userId, UUID audioCardId) {
        return audioCardRepository.findByIdAndUserId(audioCardId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Аудиовизитка не найдена"));
    }

    private AudioCard findPublishedCard(UUID audioCardId) {
        return audioCardRepository.findByIdAndIsPublishedTrue(audioCardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Опубликованная визитка не найдена"));
    }

    private AudioCard findCard(UUID audioCardId) {
        return audioCardRepository.findById(audioCardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Аудиовизитка не найдена"));
    }

    private synchronized AudioCard ensurePublicCode(AudioCard card) {
        if (card.isPublished() && card.getPublicCode() == null) {
            card.setPublicCode(generatePublicCode());
            return audioCardRepository.save(card);
        }
        return card;
    }

    private synchronized String generatePublicCode() {
        for (int attempt = 0; attempt < 30; attempt++) {
            char[] value = new char[6];
            value[0] = CODE_LETTERS.charAt(CODE_RANDOM.nextInt(CODE_LETTERS.length()));
            value[1] = CODE_DIGITS.charAt(CODE_RANDOM.nextInt(CODE_DIGITS.length()));
            for (int index = 2; index < value.length; index++) {
                value[index] = CODE_ALPHABET.charAt(CODE_RANDOM.nextInt(CODE_ALPHABET.length()));
            }
            for (int index = value.length - 1; index > 0; index--) {
                int swapIndex = CODE_RANDOM.nextInt(index + 1);
                char current = value[index];
                value[index] = value[swapIndex];
                value[swapIndex] = current;
            }
            String code = new String(value);
            if (!audioCardRepository.existsByPublicCode(code)) return code;
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Не удалось сгенерировать код визитки");
    }

    private PublicMediaResponse loadSoundFile(String path, UUID ownerId) {
        try {
            var response = soundClient.get()
                    .uri(path)
                    .header("X-Authenticated-User-Id", ownerId.toString())
                    .retrieve()
                    .toEntity(byte[].class);
            String contentType = response.getHeaders().getContentType() == null
                    ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                    : response.getHeaders().getContentType().toString();
            return new PublicMediaResponse(response.getBody(), contentType);
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Аудиофайл не найден");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Не удалось загрузить аудиофайл");
        }
    }

    private List<String> normalizeSkills(List<String> skills) {
        if (skills == null) return new ArrayList<>();
        if (skills.size() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Можно указать не более 20 технологий");
        }
        List<String> normalized = new ArrayList<>();
        Set<String> unique = new HashSet<>();
        for (String value : skills) {
            String skill = value == null ? "" : value.trim().replaceAll("\\s+", " ");
            if (skill.isEmpty() || skill.length() > 50) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Название технологии должно содержать от 1 до 50 символов");
            }
            if (!unique.add(skill.toLowerCase(Locale.ROOT))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Технологии не должны повторяться");
            }
            normalized.add(skill);
        }
        return normalized;
    }
}
