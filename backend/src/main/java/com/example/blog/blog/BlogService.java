package com.example.blog.blog;

import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class BlogService {
    private final BlogRepository blogRepository;

    public BlogService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    public List<Blog> listBlogs() {
        return blogRepository.findAll();
    }

    public List<Blog> listPublishedBlogs() {
        return blogRepository.findAll().stream().filter(Blog::isPublished).toList();
    }

    public Blog getBlog(Long id) {
        return blogRepository.findById(id).orElseThrow(() -> new BlogNotFoundException(id));
    }

    public Blog getBySlug(String slug) {
        return blogRepository.findBySlug(slug)
                .orElseThrow(() -> new BlogNotFoundException(slug));
    }

    public Blog createBlog(Blog blog) {
        if (blog.getSlug() == null || blog.getSlug().isBlank()) {
            blog.setSlug(slugify(blog.getTitle()));
        }
        return blogRepository.save(blog);
    }

    public Blog updateBlog(Long id, Blog update) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new BlogNotFoundException(id));
        blog.setTitle(update.getTitle());
        blog.setContent(update.getContent());
        blog.setSlug(update.getSlug() == null || update.getSlug().isBlank()
                ? slugify(update.getTitle()) : update.getSlug());
        blog.setExcerpt(update.getExcerpt());
        blog.setImageUrl(update.getImageUrl());
        blog.setPublished(update.isPublished());
        return blogRepository.save(blog);
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9çğıöşü]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    public void deleteBlog(Long id) {
        if (!blogRepository.existsById(id)) {
            throw new BlogNotFoundException(id);
        }
        blogRepository.deleteById(id);
    }
}
