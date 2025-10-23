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

export async function getMusicas(): Promise<Musica[]> {
  const r = await fetch(`${BASE}/musicas`);
  if (!r.ok) throw new Error(`Falha ao carregar músicas: ${r.status}`);
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

export async function getMusica(id: string | number) {
  const r = await fetch(`${BASE}/musicas/${id}`);
  if (!r.ok) throw new Error(`Falha ao carregar música ${id}: ${r.status}`);
  return r.json();
}
