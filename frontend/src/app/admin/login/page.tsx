"use client";
import { FormEvent, useState } from "react";
import { apiJson } from "@/lib/api";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { const result = await apiJson<{ csrfToken: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }); sessionStorage.setItem("csrfToken", result.csrfToken); router.push("/admin"); } catch { setError("Giriş bilgileri hatalı."); } }
  return <main className="shell narrow"><p className="eyebrow">Yönetim</p><h1>Giriş yap</h1><form className="form" onSubmit={login}><label>Kullanıcı adı<input name="username" required defaultValue="admin" /></label><label>Şifre<input name="password" type="password" required /></label><button className="button">Giriş</button>{error && <p className="error">{error}</p>}</form></main>;
}
