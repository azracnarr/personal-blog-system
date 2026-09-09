package com.example.blog.blog;

import jakarta.validation.Valid;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import com.example.blog.auth.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {
    private final BlogService blogService;
    private final AuthService authService;

    public BlogController(BlogService blogService, AuthService authService) {
        this.blogService = blogService;
        this.authService = authService;
    }

    @GetMapping
    public List<Blog> listBlogs() {
        return blogService.listPublishedBlogs();
    }

    @GetMapping("/admin")
    public List<Blog> listAllBlogs(HttpServletRequest request) {
        authService.requireAdmin(request);
        return blogService.listBlogs();
    }

    @GetMapping("/{id}")
    public Blog getBlog(@PathVariable Long id) {
        return blogService.getBlog(id);
    }

    @GetMapping("/slug/{slug}")
    public Blog getBlogBySlug(@PathVariable String slug) {
        return blogService.getBySlug(slug);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Blog createBlog(@Valid @RequestBody Blog blog, HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        return blogService.createBlog(blog);
    }

    @PutMapping("/{id}")
    public Blog updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody Blog blog,
            HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        return blogService.updateBlog(id, blog);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlog(@PathVariable Long id, HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
        blogService.deleteBlog(id);
    }
}
