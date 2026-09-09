import Link from "next/link";  //Bir blog başlığına tıklayıp yazının tamamına gitmeni sağlayar

import { apiJson } from "@/lib/api"; //Yazıları istemek için kullanacağımız yardımcıyı kullanıma alıyor.

type Blog = { id: number; title: string; content: string; excerpt?: string };

export default async function BlogList() {
  let blogs: Blog[] = []; try { blogs = await apiJson<Blog[]>("/api/blogs"); } catch { }
  return <main className="shell"><p className="eyebrow">Arşiv</p><h1>Blog yazıları</h1><div className="cards">{blogs.map(blog => <article className="card" key={blog.id}><h2><Link href={`/blog/${blog.id}`}>{blog.title}</Link></h2><p>{blog.excerpt || blog.content.slice(0, 220)}…</p></article>)}</div>{!blogs.length && <p className="muted">Henüz yazı eklenmedi.</p>}</main>;
}
