package com.example.blog.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final boolean secureCookie;

    public AuthController(AuthService authService, @Value("${app.cookie-secure:false}") boolean secureCookie) {
        this.authService = authService;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        if (!authService.credentialsMatch(request.username(), request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Kullanici adi veya sifre hatali");
        }
        String csrf = randomToken();
        response.addHeader("Set-Cookie", cookie(AuthService.AUTH_COOKIE, authService.token(request.username()), true, 43200).toString());
        response.addHeader("Set-Cookie", cookie(AuthService.CSRF_COOKIE, csrf, false, 43200).toString());
        return Map.of("username", request.username(), "csrfToken", csrf);
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        response.addHeader("Set-Cookie", cookie(AuthService.AUTH_COOKIE, "", true, 0).toString());
        response.addHeader("Set-Cookie", cookie(AuthService.CSRF_COOKIE, "", false, 0).toString());
    }

    @GetMapping("/me")
    public Map<String, Boolean> me(HttpServletRequest request) {
        return Map.of("authenticated", authService.isAuthenticated(request));
    }

    private ResponseCookie cookie(String name, String value, boolean httpOnly, long maxAge) {
        return ResponseCookie.from(name, value).httpOnly(httpOnly).secure(secureCookie)
                .sameSite("Lax").path("/").maxAge(maxAge).build();
    }

    private String randomToken() {
        byte[] value = new byte[32];
        new SecureRandom().nextBytes(value);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
}
