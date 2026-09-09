package com.example.blog.contact;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "contact_messages")
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false, length = 120)
    private String name;
    @NotBlank @Email @Column(nullable = false, length = 200)
    private String email;
    @NotBlank @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    @Column(nullable = false)
    private boolean readMessage;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist void createTime() { createdAt = Instant.now(); }
    protected ContactMessage() {}
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isReadMessage() { return readMessage; }
    public void setReadMessage(boolean readMessage) { this.readMessage = readMessage; }
    public Instant getCreatedAt() { return createdAt; }
}
