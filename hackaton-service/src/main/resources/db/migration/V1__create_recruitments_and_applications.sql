CREATE TABLE team_recruitments (
    id UUID PRIMARY KEY,
    creator_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    participants_needed INTEGER NOT NULL CHECK (participants_needed > 0),
    event_format VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    event_url VARCHAR(500),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE team_recruitment_skills (
    recruitment_id UUID NOT NULL REFERENCES team_recruitments(id) ON DELETE CASCADE,
    skill VARCHAR(50) NOT NULL,
    PRIMARY KEY (recruitment_id, skill)
);

CREATE TABLE team_applications (
    id UUID PRIMARY KEY,
    recruitment_id UUID NOT NULL REFERENCES team_recruitments(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL,
    audio_card_id UUID NOT NULL,
    message VARCHAR(1000),
    status VARCHAR(20) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE,
    decided_at TIMESTAMP WITH TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_application_recruitment_applicant UNIQUE (recruitment_id, applicant_id)
);

CREATE INDEX idx_recruitment_status_deadline ON team_recruitments(status, deadline);
CREATE INDEX idx_application_recruitment ON team_applications(recruitment_id);
CREATE INDEX idx_application_applicant ON team_applications(applicant_id);
