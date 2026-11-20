package audio.business.sound.controller;

import audio.business.sound.service.VoiceProfileProcessingService;
import audio.business.sound.voice.VoiceProfile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/voice-profile")
public class VoiceProfileController {
    private final VoiceProfileProcessingService processingService;

    public VoiceProfileController(VoiceProfileProcessingService processingService) {
        this.processingService = processingService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VoiceProfile process(@RequestParam("file") MultipartFile file) {
        return processingService.process(file);
    }
}
