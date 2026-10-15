
package audio.business.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class AuthenticatedUserFilter
        implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest()
                .mutate()
                .headers(headers -> {
                    headers.remove("X-Authenticated-User-Id");
                    headers.remove("X-Authenticated-User-Role");
                })
                .build();

        return exchange.getPrincipal()
                .cast(Authentication.class)
                .defaultIfEmpty(new org.springframework.security.authentication
                                .AnonymousAuthenticationToken(
                                "anonymous",
                                "anonymous",
                                java.util.List.of(new org.springframework.security.core
                                                .authority.SimpleGrantedAuthority(
                                                "ROLE_ANONYMOUS"
                                        )
                                )
                        )
                )
                .flatMap(authentication -> {
                    ServerHttpRequest.Builder builder = request.mutate();

                    if (authentication instanceof JwtAuthenticationToken jwtAuth) {

                        String userId = jwtAuth.getToken().getSubject();

                        UUID.fromString(userId);

                        String role = jwtAuth.getToken().getClaimAsString("role");

                        builder.header("X-Authenticated-User-Id", userId);

                        if (role != null) {
                            builder.header("X-Authenticated-User-Role", role);
                        }
                    }

                    return chain.filter(exchange.mutate()
                            .request(builder.build())
                            .build()
                    );
                });
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
