package com.example.blog.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "about")
public class About {
    @Id
    private Long id = 1L;
    @NotBlank
    @Column(nullable = false, length = 120)
    private String name = "Blog sahibi";
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String bio = "Kisisel blog";
    @Column(length = 500)
    private String avatarUrl;

    public About() {}
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
