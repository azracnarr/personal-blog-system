import { apiJson } from "@/lib/api";
type Project = { id: number; name: string; description: string; imageUrl?: string; url?: string };
export default async function ProjectsPage() {
  let projects: Project[] = []; try { projects = await apiJson<Project[]>("/api/projects"); } catch {}
  return <main className="shell"><p className="eyebrow">Üretimler</p><h1>Projeler</h1><p>Fikirden çalışan ürüne uzanan denemeler, araçlar ve hikâyeler.</p><div className="cards">{projects.map(p => <article className="card" key={p.id}>{p.imageUrl && <img className="card-image" src={p.imageUrl} alt="" />}<p className="eyebrow">Case study</p><h2>{p.name}</h2><p>{p.description}</p>{p.url && <a className="accent" href={p.url} target="_blank" rel="noreferrer">Projeyi aç →</a>}</article>)}</div></main>;
}
