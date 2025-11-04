// src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type Musica = {
  id: number;
  nome: string;
  artista: string;
  album: string;
  duracao: string;
};

export type MusicaIn = Omit<Musica, "id">;

export type MusicaPage = {
  items: Musica[];
  total: number;
  page: number;
  page_size: number;
};

export async function getMusicasPage(params?: {
  q?: string;
  page?: number;
  page_size?: number;
  order?: "id_asc" | "id_desc" | "nome_asc" | "nome_desc";
}): Promise<MusicaPage> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  if (params?.order) sp.set("order", params.order);

  const r = await fetch(`${BASE}/musicas?${sp.toString()}`);
  if (!r.ok) throw new Error(`Falha na busca de músicas: ${r.status}`);
  return r.json();
}

export async function getMusica(id: string | number): Promise<Musica> {
  const r = await fetch(`${BASE}/musicas/${id}`);
  if (!r.ok) throw new Error(`Falha ao carregar música ${id}: ${r.status}`);
  return r.json();
}

export async function createMusica(data: MusicaIn): Promise<Musica> {
  const r = await fetch(`${BASE}/musicas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Falha ao criar música: ${r.status}`);
  return r.json();
}

/* ---------------- Reviews / Rating ---------------- */

export type Review = {
  id: number;
  musica: string;   // nome da música salvo no backend
  nota: number;     // 0..5
  comentario: string;
};

export type ReviewIn = {
  nota: number;
  comentario: string;
};

export async function getReviews(musicaId: number | string): Promise<Review[]> {
  const r = await fetch(`${BASE}/musicas/${musicaId}/reviews`);
  if (!r.ok) throw new Error(`Falha ao carregar reviews: ${r.status}`);
  return r.json();
}

export async function createReview(
  musicaId: number | string,
  data: ReviewIn
): Promise<Review> {
  const r = await fetch(`${BASE}/musicas/${musicaId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Falha ao criar review: ${r.status}`);
  return r.json();
}

export async function getRating(musicaId: number | string): Promise<{
  musica_id: number;
  media: number | null; // pode vir null se não houver reviews
  qtde: number;
}> {
  const r = await fetch(`${BASE}/musicas/${musicaId}/rating`);
  if (!r.ok) throw new Error(`Falha ao carregar rating: ${r.status}`);
  return r.json();
}
