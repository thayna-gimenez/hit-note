import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Music as MusicIcon, Loader2, PlusCircle, User, Users } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Importações da API
import { 
    searchGenius, 
    createMusica, 
    searchUsers, 
    type GeniusResult, 
    type UsuarioPublico 
} from "../lib/api";

export function AddMusicPage() {
  const navigate = useNavigate();
  
  // Controle das Abas e Busca
  const [activeTab, setActiveTab] = useState("music"); 
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [musicResults, setMusicResults] = useState<GeniusResult[]>([]);
  const [userResults, setUserResults] = useState<UsuarioPublico[]>([]);
  
  // Estado de Importação (apenas para músicas)
  const [importingId, setImportingId] = useState<number | null>(null);

  // --- FUNÇÃO DE BUSCA UNIFICADA ---
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    if (activeTab === "music") setMusicResults([]);
    else setUserResults([]);

    try {
      if (activeTab === "music") {
        const data = await searchGenius(query);
        setMusicResults(data);
      } else {
        const data = await searchUsers(query);
        setUserResults(data);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao realizar busca.");
    } finally {
      setLoading(false);
    }
  }

  // --- IMPORTAR MÚSICA (Do Genius para o Banco) ---
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

  // --- NAVEGAR PARA PERFIL ---
  function handleUserProfile(userId: number) {
      navigate(`/usuarios/${userId}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 mb-20 min-h-screen">
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Search className="w-8 h-8 text-purple-500" />
            Explorar
        </h1>
        <p className="text-muted-foreground">Encontre novas músicas ou conecte-se com outros fãs.</p>
      </div>

      {/* --- ABAS E BARRA DE BUSCA --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto space-y-6">
        
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="music" className="flex items-center gap-2">
                <MusicIcon className="w-4 h-4" /> Buscar Músicas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Buscar Usuários
            </TabsTrigger>
        </TabsList>

        {/* Formulário de Busca */}
        <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
                placeholder={activeTab === 'music' ? "Nome da música, artista..." : "Nome do usuário..."} 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="h-12 text-lg bg-zinc-900/50 border-zinc-700"
            />
            <Button type="submit" size="lg" disabled={loading} className="bg-purple-600 hover:bg-purple-700 h-12 px-6">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
        </form>

        {/* --- CONTEÚDO: MÚSICAS --- */}
        <TabsContent value="music" className="space-y-6 mt-6">
            {musicResults.length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {musicResults.map((track) => {
                    const isImporting = importingId === track.genius_id;
                    
                    return (
                    <article
                        key={track.genius_id}
                        onClick={() => handleImport(track)}
                        className={`
                            group relative border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 flex flex-col h-full transition-all duration-300
                            ${importingId !== null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-xl hover:border-purple-500/50 hover:-translate-y-1 hover:bg-zinc-900'}
                            ${isImporting ? 'ring-2 ring-purple-500 opacity-100' : ''}
                        `}
                    >
                        {/* Overlay de Loading */}
                        {isImporting && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                                <span className="text-sm font-medium text-purple-500">Adicionando...</span>
                            </div>
                        )}

                        <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-zinc-950 relative">
                            <ImageWithFallback 
                                src={track.url_imagem_capa} 
                                alt={track.nome} 
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            {/* Ícone Hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <PlusCircle className="w-12 h-12 text-white drop-shadow-lg transform scale-75 group-hover:scale-100 transition-transform" />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col text-center">
                            <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-purple-400 transition-colors" title={track.nome}>
                                {track.nome}
                            </h3>
                            <div className="text-sm text-zinc-400 line-clamp-1" title={track.artista}>
                                {track.artista}
                            </div>
                            <div className="text-xs text-zinc-600 mt-1 truncate" title={track.album}>
                                {track.album}
                            </div>
                        </div>
                    </article>
                    );
                })}
                </div>
            )}
            
            {!loading && searched && musicResults.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                    <MusicIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhuma música encontrada no catálogo.</p>
                </div>
            )}
        </TabsContent>


        {/* --- CONTEÚDO: USUÁRIOS --- */}
        <TabsContent value="users" className="space-y-6 mt-6">
            {userResults.length > 0 && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {userResults.map((usuario) => (
                        <Card 
                            key={usuario.id}
                            onClick={() => handleUserProfile(usuario.id)}
                            className="cursor-pointer hover:bg-zinc-900 transition-colors border-zinc-800 bg-zinc-900/40"
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-zinc-800">
                                    <AvatarImage src={usuario.url_foto} />
                                    <AvatarFallback className="bg-zinc-800 text-purple-400 font-bold text-lg">
                                        {usuario.nome[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-lg truncate group-hover:text-purple-400 transition-colors">
                                        {usuario.nome}
                                    </h3>
                                    <p className="text-sm text-zinc-400 truncate">
                                        {usuario.biografia || "Sem biografia."}
                                    </p>
                                </div>
                                <User className="w-5 h-5 text-zinc-600" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && searched && userResults.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhum usuário encontrado com este nome.</p>
                </div>
            )}
        </TabsContent>

      </Tabs>
    </div>
  );
}