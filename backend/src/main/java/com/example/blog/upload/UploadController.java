package com.example.blog.upload;

import com.example.blog.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private final AuthService authService;
    private final Path uploadDir;

    public UploadController(AuthService authService, @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.authService = authService;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Upload klasoru olusturulamadi", ex);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@RequestPart("file") MultipartFile file, HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        if (file.isEmpty() || file.getSize() > 5_000_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dosya bos veya 5 MB'dan buyuk");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType();
        if (!contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Yalnizca gorsel yuklenebilir");
        }
        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Desteklenmeyen gorsel formati");
        };
        try {
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return Map.of("url", "/uploads/" + filename);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Dosya kaydedilemedi", ex);
        }
    }
}
