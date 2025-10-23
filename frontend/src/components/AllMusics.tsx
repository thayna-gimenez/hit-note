import { useEffect, useState } from "react";
import { getMusicas, type Musica } from "../lib/api";

export default function AllMusics() {
  const [items, setItems] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMusicas()
      .then(setItems)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando músicas…</div>;
  if (error) return <div style={{ color: "red" }}>Erro: {error}</div>;

  if (items.length === 0) {
    return <div>Nenhuma música ainda. Adicione a primeira pelo /docs da API 🎵</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((m) => (
        <article
          key={m.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ margin: 0 }}>{m.nome}</h3>
          <div style={{ opacity: 0.8 }}>{m.artista} — {m.album}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{m.duracao}</div>
        </article>
      ))}
    </div>
  );
}
