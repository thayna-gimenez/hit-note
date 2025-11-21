// src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type Musica = {
  id: number;
  nome: string;
  artista: string;
  album: string;
  data_lancamento: string;
  url_imagem: string;
};

export type GeniusResult = {
  genius_id: number;
  nome: string;
  artista: string;
  album: string;
  data_lancamento: string;
  url_imagem_capa: string;
};

export type MusicaIn = Omit<Musica, "id">;

export type MusicaPage = {
  items: Musica[];
  total: number;
  page: number;
  page_size: number;
};

export async function searchGenius(query: string): Promise<GeniusResult[]> {
  const token = localStorage.getItem('hitnote_token'); 
  const sp = new URLSearchParams({ query });
  
  const r = await fetch(`${BASE}/api/v1/search-genius?${sp.toString()}`);
  
  if (!r.ok) throw new Error("Erro ao buscar no Genius");
  return r.json();
}

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export type UserStats = {
  total_reviews: number;
  media_reviews: number;
  followers: number;
  likes: number;
};

export type UsuarioFull = {
  id: number;
  nome: string;
  email: string;
  biografia: string;
  url_foto: string;
  url_capa: string;
  localizacao: string;  
  data_cadastro: string; 
  stats: UserStats;
};

export type UsuarioUpdateBody = {
  nome: string;
  biografia: string;
  url_foto: string;
  url_capa: string;
  localizacao: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  usuario: Usuario;
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
  autor: string;
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
  const token = localStorage.getItem('hitnote_token');

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const r = await fetch(`${BASE}/musicas/${musicaId}/reviews`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  if (r.status === 401) {
    throw new Error("Você precisa estar logado para avaliar.");
  }

  if (!r.ok) throw new Error(`Falha ao criar review: ${r.status}`);
  return r.json();
}

export async function getRating(musicaId: number | string): Promise<{
  musica_id: number;
  media: number | null; 
  qtde: number;
}> {
  const r = await fetch(`${BASE}/musicas/${musicaId}/rating`);
  if (!r.ok) throw new Error(`Falha ao carregar rating: ${r.status}`);
  return r.json();
}

/* ---------------- Auth ---------------- */

export async function loginUser(email: string, senha: string): Promise<AuthResponse> {
  const r = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!r.ok) {
    // Tenta ler a mensagem de erro do backend se houver
    let msg = `Falha no login: ${r.status}`;
    try {
      const errorData = await r.json();
      if (errorData.detail) msg = errorData.detail;
    } catch {}
    throw new Error(msg);
  }
  
  return r.json();
}

export async function registerUser(nome: string, email: string, senha: string): Promise<Usuario> {
  const r = await fetch(`${BASE}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });

  if (!r.ok) {
    let msg = `Falha no cadastro: ${r.status}`;
    try {
      const errorData = await r.json();
      if (errorData.detail) msg = errorData.detail;
    } catch {}
    throw new Error(msg);
  }

  return r.json();
}

// --- FUNÇÕES DE PERFIL ---

export async function getMyProfile(): Promise<UsuarioFull> {
  const token = localStorage.getItem('hitnote_token');
  const r = await fetch(`${BASE}/usuarios/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!r.ok) throw new Error("Erro ao carregar perfil");
  return r.json();
}

export async function updateMyProfile(data: UsuarioUpdateBody): Promise<UsuarioFull> {
  const token = localStorage.getItem('hitnote_token');
  const r = await fetch(`${BASE}/usuarios/me`, {
    method: "PUT",
    headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Erro ao atualizar perfil");
  return r.json();
}