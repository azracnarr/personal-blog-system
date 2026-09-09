import { apiJson } from "@/lib/api";

type About = { name: string; bio: string; avatarUrl?: string };
const fallbackAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85";

export default async function AboutPage() {
  let about: About = { name: "Blog sahibi", bio: "Henüz tanıtım yazısı eklenmedi." };

  try { about = await apiJson<About>("/api/about"); } catch { }

  return <main className="shell about-layout"><div><img className="profile-image" src={about.avatarUrl || fallbackAvatar} alt={about.name} /></div><div><p className="eyebrow">Hakkımda / deneyim</p><h1>{about.name}</h1><div className="content"><p>{about.bio}</p><p>Java ve Spring Boot ile güvenilir backend servisleri, Next.js ve TypeScript ile hızlı ve erişilebilir arayüzler geliştiriyorum. Ürün fikrini araştırmadan yayına kadar taşıyan küçük, sürdürülebilir adımlara inanıyorum.</p><div className="skill-list"><span>Java · Spring Boot</span><span>TypeScript · Next.js</span><span>PostgreSQL · REST API</span><span>UI/UX · Ürün geliştirme</span></div></div></div></main>;
}
