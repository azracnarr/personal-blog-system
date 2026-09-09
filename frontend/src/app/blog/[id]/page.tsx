import { apiJson } from "@/lib/api";

type Blog = { title: string; content: string; imageUrl?: string; createdAt?: string };
export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let blog: Blog | null = null; try { blog = await apiJson<Blog>(`/api/blogs/${id}`); } catch { }
  if (!blog) return <main className="shell"><h1>Yazı bulunamadı</h1></main>;
  return <main className="shell article"><p className="eyebrow">Blog / düşünceler</p><h1>{blog.title}</h1>{blog.createdAt && <p className="muted">{new Date(blog.createdAt).toLocaleDateString("tr-TR")}</p>}{blog.imageUrl && <img className="article-image" src={blog.imageUrl} alt="" />}<div className="content">{blog.content.split("\n").map((line, i) => <p key={i}>{line}</p>)}</div></main>;
}
