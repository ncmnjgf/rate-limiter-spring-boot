package RateLimit.rateLimiter.config;

import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Configuration;

import RateLimit.rateLimiter.filter.TokenBucketRateLimiterFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.cloud.gateway.route.RouteLocator;
//defined how spring cloud gateway routes the incoming requests.
// client -> backend services

@Configuration
public class GatewayConfig {

    private final RateLimiterProperties rateLimiterProperties;
    private final TokenBucketRateLimiterFilter tokenBucketRateLimiterFilter;


    public GatewayConfig(RateLimiterProperties rateLimiterProperties, TokenBucketRateLimiterFilter tokenBucketRateLimiterFilter){
        this.rateLimiterProperties = rateLimiterProperties;
        this.tokenBucketRateLimiterFilter = tokenBucketRateLimiterFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder){

        return builder.routes()
            .route("api-route", r -> r
                .path("/api/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .filter(tokenBucketRateLimiterFilter.apply(new TokenBucketRateLimiterFilter.Config()))
                )
                .uri(rateLimiterProperties.getApiServerUrl()))
        .build();
    }

}

// Request arrives > stripPrefix(1) > remove /api/prefix > TokenBucketRateLimiterFilter > api-server-url
// Only requests whose path starts with /api/ should use this route.

// For example:

// /api/users       ✅
// /api/products    ✅
// /api/orders/123  ✅

// /hello           ❌
// /admin           ❌