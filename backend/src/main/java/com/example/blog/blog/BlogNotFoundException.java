package com.example.blog.blog;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class BlogNotFoundException extends RuntimeException {
    public BlogNotFoundException(Long id) {
        super("Blog not found: " + id);
    }

    public BlogNotFoundException(String slug) {
        super("Blog not found: " + slug);
    }
}
