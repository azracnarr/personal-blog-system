import { apiFetch } from "@/lib/api";

type HealthResponse = {
  status: string;
  checkedAt: string;
};

async function getHealth(): Promise<HealthResponse | null> {
  try {
    const response = await apiFetch("/api/health", {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">Checkpoint 1</p>
        <h1>Kisisel Blog Sistemi</h1>
        <p>
          Frontend ve backend baglantisini dogrulamak icin hazirlanan ilk
          Next.js sayfasi.
        </p>
      </section>

      <section className="status" aria-label="Backend baglanti durumu">
        <span className={health ? "dot online" : "dot offline"} />
        <div>
          <h2>Backend durumu</h2>
          <p>
            {health
              ? `Baglanti basarili: ${health.status}`
              : "Backend henuz ulasilabilir degil."}
          </p>
        </div>
      </section>
    </main>
  );
}
