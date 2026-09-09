import Link from "next/link";  //Bir blog başlığına tıklayıp yazının tamamına gitmeni sağlayar

import { apiJson } from "@/lib/api"; //Yazıları istemek için kullanacağımız yardımcıyı kullanıma alıyor.

type Blog = { id: number; title: string; content: string; excerpt?: string; imageUrl?: string; createdAt?: string };

export default async function BlogList() {
  let blogs: Blog[] = []; try { blogs = await apiJson<Blog[]>("/api/blogs"); } catch { }
  return <main className="shell"><div className="page-intro"><p className="eyebrow">Arşiv / fikirler / notlar</p><h1>Blog yazıları</h1><p>Üretirken öğrendiklerim, kullandığım araçlar ve yol boyunca aldığım küçük notlar.</p></div><div className="blog-grid">{blogs.map((blog, index) => <article className={`card blog-card ${index === 0 ? "featured-card" : ""}`} key={blog.id}>{blog.imageUrl && <img className="card-image" src={blog.imageUrl} alt="" />}<div className="card-meta"><span>0{index + 1}</span><span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("tr-TR") : "Yeni yazı"}</span></div><h2><Link href={`/blog/${blog.id}`}>{blog.title}</Link></h2><p>{blog.excerpt || blog.content.slice(0, 220)}…</p><Link className="read-more" href={`/blog/${blog.id}`}>Yazıyı oku <span>↗</span></Link></article>)}</div>{!blogs.length && <p className="muted">Henüz yazı eklenmedi.</p>}</main>;
}
