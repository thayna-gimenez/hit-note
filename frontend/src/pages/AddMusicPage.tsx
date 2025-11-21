import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Music as MusicIcon, Loader2, PlusCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { searchGenius, createMusica, type GeniusResult } from "../lib/api";

export function AddMusicPage() {
  const navigate = useNavigate();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeniusResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchGenius(query);
      setResults(data);
    } catch (err) {
      alert("Erro ao buscar músicas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(track: GeniusResult) {
    if (importingId !== null) return;

    setImportingId(track.genius_id);
    try {
      const newMusic = await createMusica({
        nome: track.nome,
        artista: track.artista,
        album: track.album,
        data_lancamento: track.data_lancamento,
        url_imagem: track.url_imagem_capa
      });

      navigate(`/musicas/${newMusic.id}`);
    } catch (err) {
      alert("Erro ao importar música.");
      setImportingId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 mb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <MusicIcon className="w-8 h-8 text-purple-500" />
            Adicionar Nova Música
        </h1>
        <p className="text-muted-foreground">Busque no catálogo global e clique para adicionar.</p>
      </div>

      {/* Barra de Busca */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <Input 
            placeholder="Nome da música ou artista..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-12 text-lg"
        />
        <Button type="submit" size="lg" disabled={loading} className="bg-purple-600 hover:bg-purple-700 h-12 px-6">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </Button>
      </form>

      {/* GRID DE RESULTADOS */}
      {results.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {results.map((track) => {
            const isImporting = importingId === track.genius_id;
            
            return (
              <article
                key={track.genius_id}
                onClick={() => handleImport(track)}
                className={`
                    group relative border rounded-xl p-4 bg-card flex flex-col h-full transition-all duration-300
                    ${importingId !== null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-xl hover:border-purple-500/50 hover:-translate-y-1'}
                    ${isImporting ? 'ring-2 ring-purple-500 opacity-100' : ''}
                `}
              >
                {/* Overlay de Carregamento (Aparece só no card clicado) */}
                {isImporting && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                        <span className="text-sm font-medium text-purple-500">Adicionando...</span>
                    </div>
                )}

                {/* Capa do Álbum */}
                <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-zinc-900 relative">
                  <ImageWithFallback 
                      src={track.url_imagem_capa} 
                      alt={track.nome} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  
                  {/* Ícone de "+" que aparece no hover (UX visual) */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlusCircle className="w-12 h-12 text-white drop-shadow-lg transform scale-75 group-hover:scale-100 transition-transform" />
                  </div>
                </div>

                {/* Informações */}
                <div className="flex-1 flex flex-col text-center">
                  <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-purple-400 transition-colors" title={track.nome}>
                    {track.nome}
                  </h3>
                  <div className="text-sm opacity-80 line-clamp-1" title={track.artista}>
                    {track.artista}
                  </div>
                  <div className="text-xs opacity-60 mt-1 truncate" title={track.album}>
                    {track.album}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 text-muted-foreground bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
            <p>Nenhum resultado encontrado para "{query}".</p>
        </div>
      )}
    </div>
  );
}