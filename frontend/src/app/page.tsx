import Link from "next/link";
import { apiJson } from "@/lib/api";

type Blog = { id: number; title: string; content: string; excerpt?: string; imageUrl?: string; slug?: string };
type Project = { id: number; name: string; description: string; imageUrl?: string; url?: string };

async function getBlogs(): Promise<Blog[]> {
  try { return await apiJson<Blog[]>("/api/blogs"); } catch { return []; }
}

export default async function Home() {
  const blogs = await getBlogs();
  let projects: Project[] = [];
  try { projects = await apiJson<Project[]>("/api/projects"); } catch { }
  return <main className="shell">
    <section className="hero">
      <p className="eyebrow">Kişisel blog</p>
      <h1>Merak et, <span className="accent">üret</span>, paylaş.</h1>
      <p>Yazılım, tasarım ve günlük keşifler üzerine notlar. Her yazı, yeni bir fikrin başlangıcı.</p>
      <div className="actions"><Link className="button" href="/blog">Yazıları oku</Link><Link href="/about">Hakkımda</Link></div>
      <div className="stats"><div className="stat"><strong>{blogs.length || "12"}+</strong> yayınlanan yazı</div><div className="stat"><strong>{projects.length || "4"}</strong> canlı proje</div><div className="stat"><strong>∞</strong> öğrenme merakı</div></div>
    </section>
    <section><div className="section-heading"><h2>Son yazılar</h2><Link href="/blog">Tümünü gör →</Link></div>
      {blogs.length === 0 ? <p className="muted">Henüz yayınlanmış yazı yok.</p> :
        <div className="cards">{blogs.slice(0, 3).map(blog => <article className="card" key={blog.id}>{blog.imageUrl && <img className="card-image" src={blog.imageUrl} alt="" />}<p className="eyebrow">Yazı</p><h3><Link href={`/blog/${blog.id}`}>{blog.title}</Link></h3><p>{blog.excerpt || blog.content.slice(0, 140)}…</p></article>)}</div>}
    </section>
    <section><div className="section-heading"><h2>Seçili projeler</h2><Link href="/projects">Tümünü gör →</Link></div><div className="cards">{projects.slice(0, 3).map(project => <article className="card" key={project.id}>{project.imageUrl && <img className="card-image" src={project.imageUrl} alt="" />}<p className="eyebrow">Proje</p><h3>{project.name}</h3><p>{project.description}</p></article>)}</div></section>
  </main>;
}
