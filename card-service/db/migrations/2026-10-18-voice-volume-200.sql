-- Existing databases retain Hibernate's original 0..100 check after @Max changes.
-- Run this once when deploying support for voice volume up to 200%.
BEGIN;

ALTER TABLE card_settings
    DROP CONSTRAINT IF EXISTS card_settings_voice_volume_check;

ALTER TABLE card_settings
    ADD CONSTRAINT card_settings_voice_volume_check
    CHECK (voice_volume BETWEEN 0 AND 200);

COMMIT;
