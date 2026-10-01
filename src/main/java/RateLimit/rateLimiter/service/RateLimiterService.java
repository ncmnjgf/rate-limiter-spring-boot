package RateLimit.rateLimiter.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RateLimiterService {
    
    private final RedisTokenBucketService redisTokenBucketService;

    public boolean isAllowed(String clientId) {
        return redisTokenBucketService.isAllowed(clientId);
    }

    public long getCapacity(String clientId) {
        return redisTokenBucketService.getCapacity(clientId);
    }

    public long getAvailableTokens(String clientId) {
        return redisTokenBucketService.getAvailableTokens(clientId);
    }
}

//client request -> Gateway filter (Interceptor request) -> Check Rate Limit multi filter can be chained global filter ,chain filter
//Route Filters -> applied to specific route
//custome Filter -> we are using n our project pre filter  