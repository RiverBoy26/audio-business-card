
package audio.business.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            ReactiveJwtAuthenticationConverter converter
    ) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(auth -> auth
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/logout"
                        ).permitAll()

                        .pathMatchers(HttpMethod.GET, "/api/v1/auth/users/*/avatar").permitAll()

                        .pathMatchers(HttpMethod.GET, "/public/audio-cards/**").permitAll()

                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/v1/auth/me"
                        ).authenticated()

                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/me/avatar").authenticated()

                        .pathMatchers(
                                "/audio-cards",
                                "/audio-cards/**"
                        ).hasAnyRole("USER", "ADMIN")

                        .pathMatchers(
                                "/api/music",
                                "/api/music/**",
                                "/api/voice-recordings",
                                "/api/voice-recordings/**",
                                "/api/voice-profile"
                        ).hasAnyRole("USER", "ADMIN")

                        .anyExchange().denyAll()
                )
                .oauth2ResourceServer(oauth ->
                        oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)))
                .build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");

            if (!"USER".equals(role) && !"ADMIN".equals(role)) {
                return Flux.empty();
            }

            return Flux.just(new SimpleGrantedAuthority("ROLE_" + role));
        });

        return converter;
    }
}
