"use client";
import { FormEvent, useState } from "react";
import { apiJson } from "@/lib/api";
export default function ContactPage() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { await apiJson("/api/contact", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }); setMessage("Mesajınız gönderildi."); event.currentTarget.reset(); } catch { setMessage("Mesaj gönderilemedi."); }
  }
  return <main className="shell narrow"><p className="eyebrow">İletişim</p><h1>Merhaba deyin.</h1><form onSubmit={submit} className="form"><label>Adınız<input name="name" required /></label><label>E-posta<input type="email" name="email" required /></label><label>Mesajınız<textarea name="message" rows={7} required /></label><button className="button">Gönder</button>{message && <p className="notice">{message}</p>}</form></main>;
}
