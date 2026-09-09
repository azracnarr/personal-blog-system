"use client";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch, apiJson } from "@/lib/api";
import { useRouter } from "next/navigation";
type Blog = { id: number; title: string; content: string; published: boolean; imageUrl?: string };
type Project = { id: number; name: string; description: string; url?: string; imageUrl?: string };
type About = { name: string; bio: string; avatarUrl?: string };
type Message = { id: number; name: string; email: string; message: string; readMessage: boolean };
export default function AdminPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]); const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); const [about, setAbout] = useState<About>({ name: "", bio: "" }); const [status, setStatus] = useState(""); const [openMessage, setOpenMessage] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false); const [checkingAuth, setCheckingAuth] = useState(true);
  const csrf = () => {
    const cookieToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("blog_csrf="))
      ?.split("=")[1];
    return cookieToken || sessionStorage.getItem("csrfToken") || "";
  };
  useEffect(() => {
    let active = true;
    apiJson<{ authenticated: boolean }>("/api/auth/me").then(({ authenticated }) => {
      if (!active) return;
      if (!authenticated) { router.replace("/admin/login"); return; }
      setCheckingAuth(false);
      return Promise.all([
        apiJson<Blog[]>("/api/blogs/admin").then(setBlogs),
        apiJson<Project[]>("/api/admin/projects").then(setProjects),
        apiJson<About>("/api/about").then(setAbout),
        apiJson<Message[]>("/api/contact").then(setMessages)
      ]).catch(() => setStatus("Yönetim verileri yüklenemedi."));
    }).catch(() => { if (active) router.replace("/admin/login"); });
    return () => { active = false; };
  }, [router]);
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
  async function clearAboutImage() { try { const updated = await apiJson<About>("/api/about", { method: "PUT", headers: { "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ name: about.name, bio: about.bio, avatarUrl: "" }) }); setAbout(updated); setStatus("Profil fotoğrafı kaldırıldı."); } catch (error) { setStatus(`Profil fotoğrafı kaldırılamadı: ${error instanceof Error ? error.message : "Sunucu hatası"}`); } }
  async function addProject(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { const file = data.get("image"); const imageUrl = file instanceof File && file.size ? await upload(file) : ""; const project = await apiJson<Project>("/api/projects", { method: "POST", headers: { "X-CSRF-TOKEN": csrf() }, body: JSON.stringify({ name: data.get("name"), url: data.get("url"), description: data.get("description"), imageUrl, featured: true }) }); setProjects([project, ...projects]); form.reset(); setStatus("Proje ve görsel kaydedildi."); } catch { setStatus("Proje kaydedilemedi."); } }
  async function removeProject(id: number) { try { const response = await apiFetch(`/api/projects/${id}`, { method: "DELETE", headers: { "X-CSRF-TOKEN": csrf() } }); if (!response.ok) throw new Error((await response.text()).trim() || "Proje silinemedi."); setProjects(current => current.filter(project => project.id !== id)); setStatus("Proje kaldırıldı."); } catch (error) { setStatus(`Proje silinemedi: ${error instanceof Error ? error.message : "Sunucu hatası"}`); } }
  async function removeMessage(id: number) { try { const response = await apiFetch(`/api/contact/${id}`, { method: "DELETE", headers: { "X-CSRF-TOKEN": csrf(), Accept: "application/json" } }); if (!response.ok) { const details = (await response.text()).trim(); throw new Error(details || `Sunucu mesajı silemedi (${response.status}).`); } setMessages(current => current.filter(message => message.id !== id)); setOpenMessage(null); setStatus("Mesaj silindi."); } catch (error) { setStatus(`Mesaj silinemedi: ${error instanceof Error ? error.message : "Sunucu hatası"}`); } }
  function replyTo(message: Message) { const subject = encodeURIComponent(`Re: Kişisel Blog mesajınız`); const body = encodeURIComponent(`Merhaba ${message.name},\n\nMesajınız için teşekkürler.\n\n\nSevgiler,\nAda`); const gmailUrl = `https://mail.google.com/mail/u/0/?authuser=${encodeURIComponent("azracinaarr7@gmail.com")}&view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${subject}&body=${body}`; window.open(gmailUrl, "_blank", "noopener,noreferrer"); }
  async function openIncomingMessage(message: Message) {
    setOpenMessage(openMessage === message.id ? null : message.id);
    if (!message.readMessage) {
      try {
        await apiJson<Message>(`/api/contact/${message.id}/read`, { method: "PUT", headers: { "X-CSRF-TOKEN": csrf() } });
        setMessages(current => current.map(item => item.id === message.id ? { ...item, readMessage: true } : item));
      } catch (error) {
        setStatus(`Mesaj okunmuş olarak işaretlenemedi: ${error instanceof Error ? error.message : "Sunucu hatası"}`);
      }
    }
  }
  if (checkingAuth) return <main className="shell narrow"><p className="eyebrow">Yönetim paneli</p><h1>Oturum kontrol ediliyor...</h1></main>;
  return <main className="shell"><p className="eyebrow">Yönetim paneli</p><h1>İçerik yönetimi</h1>{status && <p className="notice">{status}</p>}
    <section><h2>Yeni yazı</h2><form className="form admin-form" onSubmit={addWithImage}><input name="title" placeholder="Başlık" required /><textarea name="content" placeholder="İçerik" rows={5} required /><label>Kapak görseli<input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" /></label><button className="button" disabled={uploading}>{uploading ? "Yükleniyor..." : "Yayınla"}</button></form><div className="admin-list">{blogs.map(blog => <div key={blog.id}><strong>{blog.title}</strong><button onClick={() => remove(blog.id)} className="link-button">Sil</button></div>)}</div></section>
    <section><h2>Hakkımda</h2><form className="form admin-form" onSubmit={saveAbout}><input name="name" value={about.name} onChange={e => setAbout({ ...about, name: e.target.value })} required /><textarea name="bio" value={about.bio} onChange={e => setAbout({ ...about, bio: e.target.value })} rows={4} required /><label>Profil fotoğrafı<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/gif" /></label>{about.avatarUrl && <div className="admin-image-actions"><img className="admin-avatar-preview" src={about.avatarUrl} alt="Mevcut profil fotoğrafı" /><button type="button" className="link-button" onClick={clearAboutImage}>Fotoğrafı kaldır</button></div>}<button className="button" disabled={uploading}>{uploading ? "Yükleniyor..." : "Kaydet"}</button></form></section>
    <section><h2>Proje ekle</h2><form className="form admin-form" onSubmit={addProject}><input name="name" placeholder="Proje adı" required /><input name="url" placeholder="GitHub veya canlı proje bağlantısı" /><textarea name="description" placeholder="Projenin amacı ve içeriği" rows={3} required /><label>Proje görseli<input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" /></label><button className="button" disabled={uploading}>{uploading ? "Yükleniyor..." : "Proje ekle"}</button></form><div className="admin-list">{projects.map(project => <div key={project.id}><span><strong>{project.name}</strong>{project.url && <small className="admin-project-url">{project.url}</small>}</span><button type="button" onClick={() => removeProject(project.id)} className="link-button">Sil</button></div>)}</div></section>
    <section className="inbox-section"><div className="section-heading"><div><p className="eyebrow">Gelen kutusu</p><h2>Gelen mesajlar</h2></div><span className="unread-count">{messages.filter(item => !item.readMessage).length} okunmamış</span></div><div className="message-list">{[...messages].sort((a, b) => Number(a.readMessage) - Number(b.readMessage)).map(item => <article className={`message-card ${item.readMessage ? "is-read" : "is-unread"} ${openMessage === item.id ? "is-open" : ""}`} key={item.id}><button type="button" className="message-summary" onClick={() => openIncomingMessage(item)}><span className="message-dot" /><span className="message-heading"><strong>{item.name}</strong><small>{item.email}</small></span><span className="message-preview">{item.message}</span><span className="message-chevron">{openMessage === item.id ? "−" : "+"}</span></button>{openMessage === item.id && <div className="message-detail"><p>{item.message}</p><div className="message-actions"><button type="button" onClick={() => replyTo(item)} className="button reply-button">Gmail ile yanıtla ↗</button><button type="button" onClick={() => removeMessage(item.id)} className="link-button">Mesajı sil</button><span>{item.readMessage ? "Okundu" : "Okundu olarak işaretleniyor"}</span></div></div>}</article>)}</div>{!messages.length && <p className="muted">Henüz mesaj yok.</p>}</section>
  </main>;
}
