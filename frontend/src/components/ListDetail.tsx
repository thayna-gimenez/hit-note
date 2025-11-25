import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Edit2, Music, Trash2, Save, List, Calendar, User, Globe, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Separator } from "./ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { getMusicasPage, addMusicToList, getRating, type Musica, type MusicaPage } from "../lib/api";


// Importe os tipos e funções de API necessários
import {
    getListaDetails,
    deleteLista,
    removeMusicFromList,
    updateLista,
    type ListaFull,
    type ListaItem
} from "../lib/api";

export function ListDetail() {
    const { listaId } = useParams<{ listaId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [list, setList] = useState<ListaFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ListaItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const isOwner = user && list && user.id === list.usuario_id;

    const [isEditingList, setIsEditingList] = useState(false);
    const [editForm, setEditForm] = useState({
        nome: '',
        descricao: '',
        publica: true
    });

    useEffect(() => {
        if (list) {
            setEditForm({
                nome: list.nome,
                descricao: list.descricao || '',
                publica: list.publica,
            });
        }
    }, [list]);

    async function handleSaveEdit() {
        if (!list) return;

        try {
            const updatedList = await updateLista(list.id, editForm);

            setList(prev => prev ? {
                ...prev,
                nome: updatedList.nome,
                descricao: updatedList.descricao,
                publica: updatedList.publica,
            } : null);

            setIsEditingList(false);
        } catch (err) {
            alert("Erro ao atualizar lista.");
        }
    }

    useEffect(() => {
        if (!listaId) {
            setError("ID da lista não fornecido.");
            setLoading(false);
            return;
        }

        async function loadList() {
            setLoading(true);
            setError(null);
            try {
                const data = await getListaDetails(listaId!);
                setList(data);
            } catch (err: any) {
                console.error("Erro ao carregar lista:", err);
                setError(err.message || "Lista não encontrada ou acesso negado.");
            } finally {
                setLoading(false);
            }
        }
        loadList();
    }, [listaId]);

    async function handleDeleteList() {
        if (!window.confirm("Tem certeza que deseja apagar esta lista permanentemente?")) return;
        if (!list || !user) return; 

        try {
            await deleteLista(list.id);
            alert("Lista apagada com sucesso!");
            navigate(`/perfil/${user.id}`, { replace: true }); 
        } catch (err) {
            alert("Erro ao deletar lista. Você pode não ser o dono.");
        }
    }

    async function handleRemoveMusic(musicaId: number) {
        if (!list || !user) return;
        try {
            await removeMusicFromList(list.id, musicaId);

            setList(prev => prev ? {
                ...prev,
                items: prev.items.filter(item => item.id !== musicaId),
                song_count: prev.song_count - 1
            } : null);

        } catch (err) {
            alert("Erro ao remover música da lista.");
        }
    }

    if (loading) return <div className="container py-20 text-center">Carregando detalhes da lista...</div>;
    if (error || !list) return <div className="container py-20 text-center text-red-500">{error || "Erro ao carregar lista."}</div>;


    async function handleSearchMusic(query: string) {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const data = await getMusicasPage({ q: query, page_size: 10 });

            const mappedResults: ListaItem[] = data.items.map(musica => ({
                ...musica,
                adicionado_em: "",
            }));

            setSearchResults(mappedResults);
        } catch (error) {
            console.error("Erro ao buscar músicas:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    async function handleAddMusic(musicaId: number) {
        if (!list) return;

        try {
            await addMusicToList(list.id, musicaId);

            const addedMusic = searchResults.find(m => m.id === musicaId);

            if (addedMusic) {
                setList(prev => prev ? {
                    ...prev,
                    items: [{
                        ...addedMusic,
                        adicionado_em: new Date().toISOString()
                    }, ...prev.items],
                    song_count: prev.song_count + 1
                } : null);

                setSearchQuery('');
                setSearchResults([]);
                setShowSearch(false);
            }

        } catch (error) {
            console.error("Erro ao adicionar música:", error);
            alert("Erro ao adicionar música. Ela pode já estar na lista ou você não tem permissão.");
        }
    }
    console.log(`Dono da Lista? ${isOwner}. Meu ID: ${user?.id}. ID da Lista: ${list?.usuario_id}`); 
    return (
        <div className="container mx-auto px-4 py-8 space-y-8 pb-20">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
            </Button>

            {/* HEADER DA LISTA */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        {isEditingList ? (
                            <Input
                                value={editForm.nome}
                                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                                className="text-4xl font-bold bg-zinc-800 border-purple-500"
                            />
                        ) : (
                            <h1 className="text-4xl font-bold">{list.nome}</h1>
                        )}

                        {!isEditingList && (
                            <span className="text-sm text-muted-foreground pt-1">
                                {list.publica ? <Globe className="h-4 w-4 text-green-500/70" aria-label="Pública" /> : <Lock className="h-4 w-4 text-red-500/70" aria-label="Privada" />}
                            </span>
                        )}
                    </div>

                    {isEditingList ? (
                        <Textarea
                            value={editForm.descricao}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm({ ...editForm, descricao: e.target.value })}
                            className="text-lg bg-zinc-800 border-purple-500 min-h-[100px]"
                            placeholder="Descrição da lista..."
                        />
                    ) : (
                        <p className="text-lg text-muted-foreground">{list.descricao || "Sem descrição."}</p>
                    )}

                    {/* CHECKBOX DE PÚBLICA/PRIVADA (Apenas na edição) */}
                    {isEditingList && (
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="list-publica"
                                checked={editForm.publica}
                                onChange={(e) => setEditForm({ ...editForm, publica: e.target.checked })}
                                className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="list-publica" className="text-sm text-zinc-400">Tornar lista pública</label>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400 pt-2">
                        <div className="flex items-center space-x-1"><Music className="h-4 w-4" /><span>{list.song_count} Músicas</span></div>
                        <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>Criada em: {list.createdAt ? list.createdAt.split('T')[0] : '—'}</span></div>
                        {/* incluir o nome do criador na ListaFull: 
                        <div className="flex items-center space-x-1"><User className="h-4 w-4" /><span>Por: {list.autor_nome}</span></div>
                        */}
                    </div>

                    {/* Botões de Ação */}
                    {isOwner && (
                        <div className="flex gap-2 pt-4">
                            {isEditingList ? (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditingList(false)}>Cancelar</Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleSaveEdit}
                                    >
                                        <Save className="h-4 w-4 mr-2" /> Salvar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditingList(true)}>
                                        <Edit2 className="h-4 w-4 mr-2" /> Editar
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteList}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Apagar Lista
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>


            </div>

            <Separator />

            {/* LISTA DE MÚSICAS */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">Músicas ({list.song_count})</CardTitle>
                        {isOwner && (
                            <Button size="sm" onClick={() => setShowSearch(!showSearch)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {showSearch ? "Fechar Busca" : "Adicionar Música"}
                            </Button>
                        )}
                    </div>

                </CardHeader>
                <CardContent className="space-y-4">
                    {/* ÁREA DE BUSCA (CONDICIONAL) */}
                    {isOwner && showSearch && (
                        <Card className="p-4 bg-zinc-900/50 border-purple-500/30 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-lg font-semibold mb-3">Pesquisar e Adicionar</h3>
                            <Input
                                placeholder="Nome, artista ou álbum da música..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSearchQuery(e.target.value);
                                    handleSearchMusic(e.target.value);
                                }}
                                className="mb-4 bg-zinc-950 border-zinc-700"
                            />

                            {/* RESULTADOS DA BUSCA */}
                            {(isSearching || searchResults.length > 0) && (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {isSearching ? (
                                        <div className="text-center text-sm text-muted-foreground">Buscando...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="text-center text-sm text-muted-foreground">Nenhuma música encontrada.</div>
                                    ) : (
                                        searchResults.map((music) => (
                                            <div
                                                key={`search-${music.id}`}
                                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors" 
                                            >
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                                    onClick={() => navigate(`/musicas/${music.id}`)}
                                                >

                                                    <div className="flex items-center gap-4"> 
                                                        
                                                        <ImageWithFallback src={music.url_imagem} alt={music.nome} className="h-12 w-12 object-cover transition-transform duration-500 group-hover:scale-105 rounded-md" /> {/* Aumentei para h-14 w-14 */}
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-lg truncate text-zinc-100 group-hover:text-purple-400 transition-colors">{music.nome}</span>
                                                            <span className="text-sm text-muted-foreground">{music.artista}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-purple-600 hover:bg-purple-700 shrink-0 ml-4"
                                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleAddMusic(music.id); }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* LISTA DE MÚSICAS EXISTENTES */}
                    {list.items.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Esta lista está vazia.</div>
                    ) : (
                        <div className="space-y-1">
                            {list.items.map((music) => (
                                <div
                                    key={music.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer group"
                                    onClick={() => navigate(`/musicas/${music.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <ImageWithFallback src={music.url_imagem} alt={music.nome} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-md" /> 
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg truncate text-zinc-100 group-hover:text-purple-400 transition-colors">{music.nome}</span>
                                            <span className="text-sm text-muted-foreground">{music.artista}</span>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Remover da Lista"
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                e.stopPropagation();
                                                handleRemoveMusic(music.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500/80 hover:text-red-500 transition-colors" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}