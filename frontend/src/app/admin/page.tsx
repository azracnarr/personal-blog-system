"use client";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch, apiJson } from "@/lib/api";
type Blog = { id: number; title: string; content: string; published: boolean; imageUrl?: string };
type Project = { id: number; name: string; description: string; url?: string; imageUrl?: string };
type About = { name: string; bio: string; avatarUrl?: string };
type Message = { id: number; name: string; email: string; message: string; readMessage: boolean };
export default function AdminPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]); const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); const [about, setAbout] = useState<About>({ name: "", bio: "" }); const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const csrf = () => {
    const cookieToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("blog_csrf="))
      ?.split("=")[1];
    return cookieToken || sessionStorage.getItem("csrfToken") || "";
  };
  useEffect(() => {
    apiJson<Blog[]>("/api/blogs").then(setBlogs).catch(() => setStatus("Oturum açmanız gerekiyor."));
    apiJson<Project[]>("/api/admin/projects").then(setProjects).catch(() => {});
    apiJson<About>("/api/about").then(setAbout).catch(() => {});
    apiJson<Message[]>("/api/contact").then(setMessages).catch(() => {});
  }, []);
  async function add(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); try { const blog = await apiJson<Blog>("/api/blogs", { method: "POST", headers: { "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ ...data, published: true }) }); setBlogs([blog, ...blogs]); form.reset(); setStatus("Yazı kaydedildi."); } catch (error) { setStatus(`Kayıt başarısız: ${error instanceof Error ? error.message : "Sunucu hatası"}`); } }
  async function upload(file: File): Promise<string> {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await apiJson<{ url: string }>("/api/uploads", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrf(), Accept: "application/json" },
        body: data
      });
      return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${result.url}`;
    } catch (error) {
      throw new Error(error instanceof TypeError
        ? "Backend'e ulaşılamadı. Backend'in 8080 portunda çalıştığını ve sayfayı yenilediğinizi kontrol edin."
        : error instanceof Error ? error.message : "Görsel yüklenemedi.");
    }
    finally { setUploading(false); }
  }
  async function addWithImage(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const file = data.get("image"); let imageUrl = ""; try { if (file instanceof File && file.size) imageUrl = await upload(file); const blog = await apiJson<Blog>("/api/blogs", { method: "POST", headers: { "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ title: data.get("title"), content: data.get("content"), imageUrl, published: true }) }); setBlogs([blog, ...blogs]); form.reset(); setStatus("Yazı ve görsel kaydedildi."); } catch (error) { setStatus(`Kayıt başarısız: ${error instanceof Error ? error.message : "Sunucu hatası"}`); } }
  async function remove(id: number) { await apiFetch(`/api/blogs/${id}`, { method: "DELETE", headers: { "X-CSRF-TOKEN": csrf() } }); setBlogs(blogs.filter(b => b.id !== id)); }
  async function saveAbout(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { const file = data.get("avatar"); const avatarUrl = file instanceof File && file.size ? await upload(file) : about.avatarUrl || ""; const updated = await apiJson<About>("/api/about", { method: "PUT", headers: { "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ name: data.get("name"), bio: data.get("bio"), avatarUrl }) }); setAbout(updated); setStatus("Hakkımda ve profil fotoğrafı güncellendi."); } catch (error) { setStatus(`Hakkımda kaydedilemedi: ${error instanceof Error ? error.message : "Sunucu hatası"}`); } }
  async function addProject(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { const file = data.get("image"); const imageUrl = file instanceof File && file.size ? await upload(file) : ""; const project = await apiJson<Project>("/api/projects", { method: "POST", headers: { "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ name: data.get("name"), url: data.get("url"), description: data.get("description"), imageUrl, featured: true }) }); setProjects([project, ...projects]); form.reset(); setStatus("Proje ve görsel kaydedildi."); } catch { setStatus("Proje kaydedilemedi."); } }
  function replyTo(message: Message) { const subject = encodeURIComponent(`Re: Kişisel Blog mesajınız`); const body = encodeURIComponent(`Merhaba ${message.name},\n\nMesajınız için teşekkürler.\n\n\nSevgiler,\nAda`); const gmailUrl = `https://mail.google.com/mail/u/0/?authuser=${encodeURIComponent("azracinaarr7@gmail.com")}&view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${subject}&body=${body}`; window.open(gmailUrl, "_blank", "noopener,noreferrer"); }
  return <main className="shell"><p className="eyebrow">Yönetim paneli</p><h1>İçerik yönetimi</h1>{status && <p className="notice">{status}</p>}
    <section><h2>Yeni yazı</h2><form className="form admin-form" onSubmit={addWithImage}><input name="title" placeholder="Başlık" required /><textarea name="content" placeholder="İçerik" rows={5} required /><label>Kapak görseli<input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" /></label><button className="button" disabled={uploading}>{uploading ? "Yükleniyor..." : "Yayınla"}</button></form><div className="admin-list">{blogs.map(blog => <div key={blog.id}><strong>{blog.title}</strong><button onClick={() => remove(blog.id)} className="link-button">Sil</button></div>)}</div></section>
    <section><h2>Hakkımda</h2><form className="form admin-form" onSubmit={saveAbout}><input name="name" value={about.name} onChange={e => setAbout({ ...about, name: e.target.value })} required /><textarea name="bio" value={about.bio} onChange={e => setAbout({ ...about, bio: e.target.value })} rows={4} required /><label>Profil fotoğrafı<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/gif" /></label>{about.avatarUrl && <img className="admin-avatar-preview" src={about.avatarUrl} alt="Mevcut profil fotoğrafı" />}<button className="button" disabled={uploading}>{uploading ? "Yükleniyor..." : "Kaydet"}</button></form></section>
    <section><h2>Proje ekle</h2><form className="form admin-form" onSubmit={addProject}><input name="name" placeholder="Proje adı" required /><input name="url" placeholder="https://..." /><textarea name="description" placeholder="Açıklama" rows={3} required /><label>Proje görseli<input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" /></label><button className="button" disabled={uploading}>{uploading ? "Yükleniyor..." : "Proje ekle"}</button></form><div className="admin-list">{projects.map(project => <div key={project.id}><strong>{project.name}</strong></div>)}</div></section>
    <section><h2>Gelen mesajlar</h2><div className="admin-list">{messages.map(item => <div key={item.id}><span><strong>{item.name}</strong> ({item.email})<br />{item.message}</span><button type="button" onClick={() => replyTo(item)} className="button reply-button">Yanıtla ↗</button></div>)}</div>{!messages.length && <p className="muted">Mesaj yok.</p>}</section>
  </main>;
}
