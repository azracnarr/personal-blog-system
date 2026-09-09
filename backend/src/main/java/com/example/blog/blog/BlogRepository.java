package com.example.blog.blog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    Optional<Blog> findBySlug(String slug);
}
