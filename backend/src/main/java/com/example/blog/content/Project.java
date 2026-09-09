package com.example.blog.content;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false, length = 160)
    private String name;
    @NotBlank @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(length = 500)
    private String url;
    @Column(length = 1000)
    private String imageUrl;
    @Column(nullable = false)
    private boolean featured = true;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist void createTime() { createdAt = Instant.now(); }
    protected Project() {}
    public Project(String name, String description) {
        this.name = name;
        this.description = description;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public Instant getCreatedAt() { return createdAt; }
}
