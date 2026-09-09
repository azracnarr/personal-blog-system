package com.example.blog.contact;

import com.example.blog.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final ContactMessageRepository repository;
    private final AuthService authService;

    public ContactController(ContactMessageRepository repository, AuthService authService) {
        this.repository = repository;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessage create(@Valid @RequestBody ContactMessage message) {
        return repository.save(message);
    }

    @GetMapping
    public List<ContactMessage> list(HttpServletRequest request) {
        authService.requireAdmin(request);
        return repository.findAll();
    }

    @PutMapping("/{id}/read")
    public ContactMessage markRead(@PathVariable Long id, HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        ContactMessage message = repository.findById(id).orElseThrow();
        message.setReadMessage(true);
        return repository.save(message);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        if (!repository.existsById(id)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Mesaj bulunamadi");
        }
        repository.deleteById(id);
    }
}
