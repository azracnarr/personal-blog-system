import { apiJson } from "@/lib/api";

export default async function AboutPage() {
  let about = { name: "Blog sahibi", bio: "Henüz tanıtım yazısı eklenmedi." };

  try { about = await apiJson<typeof about>("/api/about"); } catch { }

  return <main className="shell"><p className="eyebrow">Hakkımda</p><h1>{about.name}</h1><div className="content"><p>{about.bio}</p></div></main>;
}
