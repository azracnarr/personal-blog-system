package com.example.blog.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final byte[] secret;
    private final long expirationHours;

    public JwtService(
            @Value("${app.jwt-secret}") String secret,
            @Value("${app.jwt-expiration-hours:12}") long expirationHours) {
        if (secret.length() < 32) throw new IllegalArgumentException("JWT_SECRET en az 32 karakter olmalidir");
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationHours = expirationHours;
    }

    public String createToken(String username) {
        try {
            String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payload = encode("{\"sub\":\"" + escape(username) + "\",\"iat\":"
                    + Instant.now().getEpochSecond() + ",\"exp\":"
                    + Instant.now().plusSeconds(expirationHours * 3600).getEpochSecond() + "}");
            return header + "." + payload + "." + sign(header + "." + payload);
        } catch (Exception ex) {
            throw new IllegalStateException("JWT olusturulamadi", ex);
        }
    }

    public boolean isValid(String token) {
        try {
            String[] parts = token.split("\\.", -1);
            if (parts.length != 3 || !MessageDigestSupport.constantTime(sign(parts[0] + "." + parts[1]), parts[2])) {
                return false;
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            long expiration = Long.parseLong(claim(payload, "exp"));
            return expiration > Instant.now().getEpochSecond();
        } catch (Exception ex) {
            return false;
        }
    }

    public String username(String token) {
        try {
            String[] parts = token.split("\\.", -1);
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return claim(payload, "sub");
        } catch (Exception ex) {
            return "";
        }
    }

    private String claim(String payload, String name) {
            String marker = "\"" + name + "\":\"";
            int start = payload.indexOf(marker);
            if (start >= 0) {
                int end = payload.indexOf('"', start + marker.length());
                return payload.substring(start + marker.length(), end);
            }
            marker = "\"" + name + "\":";
            start = payload.indexOf(marker);
            int end = payload.indexOf(',', start + marker.length());
            if (end < 0) end = payload.indexOf('}', start + marker.length());
            return payload.substring(start + marker.length(), end);
        }

    private String escape(String value) {
            return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    static final class MessageDigestSupport {
        static boolean constantTime(String expected, String actual) {
            return java.security.MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.US_ASCII), actual.getBytes(StandardCharsets.US_ASCII));
        }
    }
}
