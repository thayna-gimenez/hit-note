import { useEffect, useMemo, useState } from "react";
import { StarRating } from "./star-rating";
import { getMusicasPage, getRating, type Musica, type MusicaPage } from "../lib/api";

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

type MusicRating = { musica_id: number; media: number | null; qtde: number };

export default function AllMusics() {
  // filtros/estado de paginação
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 400);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [order, setOrder] = useState<"id_desc" | "id_asc" | "nome_asc" | "nome_desc">("id_desc");

  // dados
  const [items, setItems] = useState<Musica[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ratings por música
  const [ratings, setRatings] = useState<Record<number, MusicRating>>({});
  const [loadingRatings, setLoadingRatings] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Carrega página de músicas
  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res: MusicaPage = await getMusicasPage({
          q: dq || undefined,
          page,
          page_size: pageSize,
          order,
        });
        if (!cancel) {
          setItems(res.items);
          setTotal(res.total);
          // se a busca mudar e a página atual extrapolar o total,
          // garantimos que não ficamos "perdidos"
          const maxPage = Math.max(1, Math.ceil(res.total / res.page_size));
          if (page > maxPage) setPage(maxPage);
        }
      } catch (e) {
        if (!cancel) setError(String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, [dq, page, pageSize, order]);

  // Carrega ratings quando os items mudarem
  useEffect(() => {
    if (!items.length) {
      setRatings({});
      return;
    }
    let cancel = false;
    async function loadRatings() {
      try {
        setLoadingRatings(true);
        const res = await Promise.all(
          items.map(async (m) => {
            try {
              const r = await getRating(m.id);
              return [m.id, r] as const;
            } catch {
              return [m.id, { musica_id: m.id, media: null, qtde: 0 }] as const;
            }
          })
        );
        if (!cancel) {
          const map: Record<number, MusicRating> = {};
          res.forEach(([id, r]) => (map[id] = r));
          setRatings(map);
        }
      } finally {
        if (!cancel) setLoadingRatings(false);
      }
    }
    loadRatings();
    return () => { cancel = true; };
  }, [items]);

  // UI
  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome, artista ou álbum…"
          className="px-3 py-2 border rounded-lg w-full sm:w-80"
        />

        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="id_desc">Mais recentes</option>
          <option value="id_asc">Mais antigas</option>
          <option value="nome_asc">Nome (A–Z)</option>
          <option value="nome_desc">Nome (Z–A)</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg"
        >
          <option value={5}>5 / pág.</option>
          <option value={8}>8 / pág.</option>
          <option value={12}>12 / pág.</option>
          <option value={20}>20 / pág.</option>
        </select>
      </div>

      {/* Estado de carregamento/erro */}
      {loading ? (
        <div>Carregando músicas…</div>
      ) : error ? (
        <div className="text-red-500">Erro: {error}</div>
      ) : items.length === 0 ? (
        <div>Nenhuma música encontrada.</div>
      ) : (
        <>
          {/* Grid de cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const r = ratings[m.id];
              const avg = r?.media ?? 0;
              const cnt = r?.qtde ?? 0;

              return (
                <article
                  key={m.id}
                  className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold">{m.nome}</h3>
                  <div className="text-sm opacity-80">{m.artista} — {m.album}</div>
                  <div className="text-xs opacity-60">{m.duracao}</div>

                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={typeof avg === "number" ? avg : 0} size="sm" />
                    <span className="text-xs opacity-75">
                      {loadingRatings && !r
                        ? "Carregando notas…"
                        : r?.media != null
                        ? `${Number(avg).toFixed(1)}/5`
                        : "—/5"}{" "}
                      {cnt ? `(${cnt})` : ""}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm opacity-75">
              Total: {total} • Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 border rounded-lg disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <button
                className="px-3 py-2 border rounded-lg disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
