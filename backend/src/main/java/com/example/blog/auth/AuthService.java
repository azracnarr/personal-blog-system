package com.example.blog.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    public static final String AUTH_COOKIE = "blog_auth";
    public static final String CSRF_COOKIE = "blog_csrf";
    private final JwtService jwtService;
    private final String username;
    private final String password;

    public AuthService(JwtService jwtService, @Value("${app.admin-username}") String username,
                       @Value("${app.admin-password}") String password) {
        this.jwtService = jwtService;
        this.username = username;
        this.password = password;
    }

    public boolean credentialsMatch(String candidateUsername, String candidatePassword) {
        return equal(username, candidateUsername) && equal(password, candidatePassword);
    }

    public String token(String username) { return jwtService.createToken(username); }

    public boolean isAuthenticated(HttpServletRequest request) {
        String token = cookie(request, AUTH_COOKIE);
        return token != null && jwtService.isValid(token) && username.equals(jwtService.username(token));
    }

    public void requireAdmin(HttpServletRequest request) {
        if (!isAuthenticated(request)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Oturum gerekli");
    }

    public void requireCsrf(HttpServletRequest request) {
        String cookie = cookie(request, CSRF_COOKIE);
        String header = request.getHeader("X-CSRF-TOKEN");
        if (cookie == null || header == null || !equal(cookie, header)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CSRF token gecersiz");
        }
    }

    private static boolean equal(String left, String right) {
        return right != null && MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8), right.getBytes(StandardCharsets.UTF_8));
    }

    public static String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }
}
