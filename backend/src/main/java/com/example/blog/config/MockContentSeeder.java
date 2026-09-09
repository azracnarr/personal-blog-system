package com.example.blog.config;

import com.example.blog.blog.Blog;
import com.example.blog.blog.BlogRepository;
import com.example.blog.content.About;
import com.example.blog.content.AboutRepository;
import com.example.blog.content.Project;
import com.example.blog.content.ProjectRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Provides useful content for a new installation without overwriting user data.
 */
@Component
public class MockContentSeeder implements CommandLineRunner {
    private static final String IMAGE_BASE = "https://images.unsplash.com/";

    private final BlogRepository blogRepository;
    private final ProjectRepository projectRepository;
    private final AboutRepository aboutRepository;

    public MockContentSeeder(BlogRepository blogRepository, ProjectRepository projectRepository,
                             AboutRepository aboutRepository) {
        this.blogRepository = blogRepository;
        this.projectRepository = projectRepository;
        this.aboutRepository = aboutRepository;
    }

    @Override
    public void run(String... args) {
        if (blogRepository.count() == 0) {
            blogRepository.saveAll(List.of(
                    blog("Modern web geliştirmede küçük adımlar", "Günlük projelerde sürdürülebilir kod yazmak için kullandığım pratikleri ve öğrendiklerimi anlatıyorum.", "modern-web-gelistirme", "photo-1498050108023-c5249f4df085"),
                    blog("Kişisel projeler için doğru araçları seçmek", "Bir fikri prototipten çalışan ürüne taşırken teknoloji seçimlerini nasıl yaptığımı keşfedin.", "kisisel-projeler-icin-araclar", "photo-1516321318423-f06f85e504b3"),
                    blog("Odaklanmış çalışmanın ritmi", "Yaratıcı üretim, planlama ve dinlenme arasında dengeli bir çalışma düzeni kurma notları.", "odaklanmis-calismanin-ritmi", "photo-1499750310107-5fef28a66643")
            ));
        }

        if (projectRepository.count() == 0) {
            projectRepository.saveAll(List.of(
                    project("Kişisel Blog", "Yazılarımı, notlarımı ve projelerimi paylaşmak için geliştirdiğim içerik platformu.", "https://github.com/", "photo-1499750310107-5fef28a66643"),
                    project("Ürün Panosu", "Ekiplerin fikirleri önceliklendirmesine ve ilerlemeyi görmesine yardımcı olan sade bir pano.", "https://github.com/", "photo-1553877522-43269d4ea984"),
                    project("Portfolyo Deneyimi", "Çalışmaları ve iletişim bilgilerini hızlı, erişilebilir bir arayüzde sunan portfolyo.", "https://github.com/", "photo-1460925895917-afdab827c52f")
            ));
        }

        if (aboutRepository.count() == 0) {
            About about = new About();
            about.setName("Ada Yılmaz");
            about.setBio("Ürün geliştirmeyi, sade arayüzleri ve öğrendiklerimi paylaşmayı seven bir yazılım geliştiricisiyim.");
            about.setAvatarUrl(image("photo-1494790108377-be9c29b29330"));
            aboutRepository.save(about);
        }
    }

    private Blog blog(String title, String content, String slug, String image) {
        Blog blog = new Blog(title, content);
        blog.setSlug(slug);
        blog.setExcerpt(content);
        blog.setImageUrl(image(image));
        return blog;
    }

    private Project project(String name, String description, String url, String image) {
        Project project = new Project(name, description);
        project.setUrl(url);
        project.setImageUrl(image(image));
        return project;
    }

    private String image(String id) {
        return IMAGE_BASE + id + "?auto=format&fit=crop&w=1200&q=80";
    }
}
