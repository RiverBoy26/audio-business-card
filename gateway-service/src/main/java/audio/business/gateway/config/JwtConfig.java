
package audio.business.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Configuration
public class JwtConfig {

    @Bean
    public ReactiveJwtDecoder jwtDecoder(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.issuer}") String issuer
    ) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);

        if (bytes.length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes");
        }

        SecretKey key = new SecretKeySpec(bytes, "HmacSHA256");

        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder
                        .withSecretKey(key)
                        .macAlgorithm(MacAlgorithm.HS256)
                        .build();

        OAuth2TokenValidator<Jwt> standardValidator = JwtValidators.createDefaultWithIssuer(issuer);

        OAuth2TokenValidator<Jwt> subjectValidator = jwt -> {
            try {
                UUID.fromString(jwt.getSubject());

                return OAuth2TokenValidatorResult.success();
            } catch (IllegalArgumentException | NullPointerException e) {
                return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                        "invalid_token", "JWT subject must be a valid UUID", null)
                );
            }
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(standardValidator, subjectValidator));

        return decoder;
    }
}
