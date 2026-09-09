"use client";
import { FormEvent, useState } from "react";
import { apiJson } from "@/lib/api";
export default function ContactPage() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try { await apiJson("/api/contact", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }); setMessage("Mesajınız gönderildi. En kısa sürede dönüş yapacağım."); formElement.reset(); } catch (error) { setMessage(error instanceof Error ? `Mesaj gönderilemedi: ${error.message}` : "Mesaj gönderilemedi."); }
  }
  return <main className="shell contact-layout"><div><p className="eyebrow">İletişim / birlikte üretelim</p><h1>Merhaba deyin.</h1><p>Bir fikir, proje veya sadece selamlaşmak için yazabilirsiniz. Gelen kutum her zaman açık.</p><div className="contact-detail"><strong>Yanıt süresi</strong><span>Genellikle 1-2 iş günü</span></div></div><form onSubmit={submit} className="form"><label>Adınız<input name="name" required /></label><label>E-posta<input type="email" name="email" required /></label><label>Mesajınız<textarea name="message" rows={7} required /></label><button className="button">Mesajı gönder ↗</button>{message && <p className="notice">{message}</p>}</form></main>;
}
