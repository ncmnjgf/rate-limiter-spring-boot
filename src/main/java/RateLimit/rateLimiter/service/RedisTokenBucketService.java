package RateLimit.rateLimiter.service;

import org.springframework.stereotype.Service;

import RateLimit.rateLimiter.config.RateLimiterProperties;
import lombok.RequiredArgsConstructor;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Jedis;
import java.time.Instant;

//store token bucket state in redis
//manage tokens per client
//handle token refill based on time
//provide rate limiting logic.
@Service
@RequiredArgsConstructor
public class RedisTokenBucketService {

    private final JedisPool jedisPool;

    private final RateLimiterProperties properties;

    private final String TOKENS_KEY_PREFIX = "rate_limiter:tokens:";
    private static final String LAST_REFILL_KEY_PREFIX = "rate_limiter:last_refill:";

    //Pattern
    //rate_limiter:{type}:{clientId}

    //rate_limiter:tokens:192.168.1.100 > Current Token Count
    //rate_limiter:last_refill:192.168.1.100 > Last Refill Timestamp

    //rate_limiter:tokens:192.168.1.100 > "7"
   // rate_limiter:last_refill:192.168.1.100 > "12324342342"

    @SuppressWarnings("unchecked")
    public boolean isAllowed(String clientId) {
        String tokenKey = TOKENS_KEY_PREFIX + clientId;
        String lastRefillKey = LAST_REFILL_KEY_PREFIX + clientId;
        long now = System.currentTimeMillis();
        String luaScript = 
            "local tokensKey = KEYS[1] " +
            "local lastRefillKey = KEYS[2] " +
            "local capacity = tonumber(ARGV[1]) " +
            "local refillRate = tonumber(ARGV[2]) " +
            "local now = tonumber(ARGV[3]) " +
            "local requested = 1 " + // one token per request
            "local lastRefill = tonumber(redis.call('get', lastRefillKey)) " +
            "local currentTokens = tonumber(redis.call('get', tokensKey)) " +
            "if lastRefill == nil or currentTokens == nil then " +
            "    currentTokens = capacity " +
            "    lastRefill = now " +
            "else " +
            "    local elapsedTime = math.max(0, now - lastRefill) " +
            "    local tokensToAdd = math.floor((elapsedTime * refillRate) / 1000) " +
            "    if tokensToAdd > 0 then " +
            "        currentTokens = math.min(capacity, currentTokens + tokensToAdd) " +
            "        lastRefill = now " +
            "    end " +
            "end " +
            "local allowed = 0 " +
            "if currentTokens >= requested then " +
            "    currentTokens = currentTokens - requested " +
            "    allowed = 1 " +
            "end " +
            "redis.call('set', tokensKey, currentTokens) " +
            "redis.call('set', lastRefillKey, lastRefill) " +
            "return {allowed, currentTokens}";

        try (Jedis jedis = jedisPool.getResource()) {
            Object result = jedis.eval(
                luaScript, 
                java.util.Arrays.asList(tokenKey, lastRefillKey), 
                java.util.Arrays.asList(
                    String.valueOf(properties.getCapacity()), 
                    String.valueOf(properties.getRefillRate()), 
                    String.valueOf(now)
                )
            );
            
            java.util.List<Long> evalResult = (java.util.List<Long>) result;
            return evalResult.get(0) == 1L;
        }
    }

    public long getCapacity(String clientId) {
        return properties.getCapacity();
    }

    public long getAvailableTokens(String clientId) {
        String tokenKey = TOKENS_KEY_PREFIX + clientId;
        String lastRefillKey = LAST_REFILL_KEY_PREFIX + clientId;
        long now = System.currentTimeMillis();

        String luaScript = 
            "local tokensKey = KEYS[1] " +
            "local lastRefillKey = KEYS[2] " +
            "local capacity = tonumber(ARGV[1]) " +
            "local refillRate = tonumber(ARGV[2]) " +
            "local now = tonumber(ARGV[3]) " +
            "local lastRefill = tonumber(redis.call('get', lastRefillKey)) " +
            "local currentTokens = tonumber(redis.call('get', tokensKey)) " +
            "if lastRefill == nil or currentTokens == nil then " +
            "    currentTokens = capacity " +
            "    lastRefill = now " +
            "else " +
            "    local elapsedTime = math.max(0, now - lastRefill) " +
            "    local tokensToAdd = math.floor((elapsedTime * refillRate) / 1000) " +
            "    if tokensToAdd > 0 then " +
            "        currentTokens = math.min(capacity, currentTokens + tokensToAdd) " +
            "        lastRefill = now " +
            "    end " +
            "end " +
            "redis.call('set', tokensKey, currentTokens) " +
            "redis.call('set', lastRefillKey, lastRefill) " +
            "return currentTokens";

        try (Jedis jedis = jedisPool.getResource()) {
            Object result = jedis.eval(
                luaScript, 
                java.util.Arrays.asList(tokenKey, lastRefillKey), 
                java.util.Arrays.asList(
                    String.valueOf(properties.getCapacity()), 
                    String.valueOf(properties.getRefillRate()), 
                    String.valueOf(now)
                )
            );
            return (Long) result;
        }
    }
}
