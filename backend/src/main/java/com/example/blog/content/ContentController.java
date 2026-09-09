package com.example.blog.content;

import com.example.blog.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ContentController {
    private final AboutRepository aboutRepository;
    private final ProjectRepository projectRepository;
    private final AuthService authService;

    public ContentController(AboutRepository aboutRepository, ProjectRepository projectRepository,
                             AuthService authService) {
        this.aboutRepository = aboutRepository;
        this.projectRepository = projectRepository;
        this.authService = authService;
    }

    @GetMapping("/about")
    public About about() {
        return aboutRepository.findById(1L).orElseGet(() -> aboutRepository.save(new About()));
    }

    @PutMapping("/about")
    public About updateAbout(@Valid @RequestBody About update, HttpServletRequest request) {
        protect(request);
        About about = aboutRepository.findById(1L).orElseGet(About::new);
        about.setName(update.getName());
        about.setBio(update.getBio());
        about.setAvatarUrl(update.getAvatarUrl());
        return aboutRepository.save(about);
    }

    @GetMapping("/projects")
    public List<Project> projects() { return projectRepository.findByFeaturedTrueOrderByCreatedAtDesc(); }

    @GetMapping("/admin/projects")
    public List<Project> allProjects(HttpServletRequest request) {
        authService.requireAdmin(request);
        return projectRepository.findAll();
    }

    @PostMapping("/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public Project createProject(@Valid @RequestBody Project project, HttpServletRequest request) {
        protect(request);
        return projectRepository.save(project);
    }

    @PutMapping("/projects/{id}")
    public Project updateProject(@PathVariable Long id, @Valid @RequestBody Project update,
                                 HttpServletRequest request) {
        protect(request);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proje bulunamadi"));
        project.setName(update.getName());
        project.setDescription(update.getDescription());
        project.setUrl(update.getUrl());
        project.setImageUrl(update.getImageUrl());
        project.setFeatured(update.isFeatured());
        return projectRepository.save(project);
    }

    @DeleteMapping("/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable Long id, HttpServletRequest request) {
        protect(request);
        if (!projectRepository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Proje bulunamadi");
        projectRepository.deleteById(id);
    }

    private void protect(HttpServletRequest request) {
        authService.requireAdmin(request);
        authService.requireCsrf(request);
    }
}
