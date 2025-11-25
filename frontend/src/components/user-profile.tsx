import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Heart, List, Music, Save, X, Edit2, MapPin, UserPlus, UserCheck, Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { MusicCard } from "./music-card";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Integração com API
import { useAuth } from "../contexts/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  getMyLikes,
  getPublicProfile,
  toggleFollow,
  getUserLikes,
  getUserLists,
  createLista,
  deleteLista,
  getUserFeed,
  type UsuarioFull,
  type Musica,
  type Lista,
  type ActivityItem,
} from "../lib/api";

export function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lógica para determinar se é o dono do perfil
  const isOwner = !id || (user && String(user.id) === id);

  // --- ESTADOS ---
  const [profile, setProfile] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<Musica[]>([]);
  const [userLists, setUserLists] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de "Seguindo" (apenas para visitantes)
  const [isFollowing, setIsFollowing] = useState(false);

  // Estados de Edição de Perfil (apenas para dono)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    biografia: "",
    url_foto: "",
    url_capa: "",
    localizacao: ""
  });

  // Estados de Criação de Lista (apenas para dono)
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListForm, setNewListForm] = useState({ nome: "", descricao: "" });

  // Estado de Atividade Recente
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Helper para extrair ano da data
  const getSafeYear = (dateString?: string) => {
    if (!dateString) return undefined;
    const yearPart = dateString.split('-')[0];
    const year = parseInt(yearPart);
    if (isNaN(year)) return undefined;
    return year;
  };

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        if (isOwner && !user) return;

        const targetId = isOwner ? user!.id : id!;

        const activityPromise = getUserFeed(targetId);

        if (isOwner) {
          // --- DONO: Carrega dados privados ---
          const [profileData, favoritesData, listsData, activityData] = await Promise.all([
            getMyProfile(),
            getMyLikes(),
            getUserLists(user!.id),
            activityPromise,
          ]);

          setProfile(profileData);
          setFavorites(favoritesData);
          setUserLists(listsData);
          setRecentActivity(activityData);

          // Preenche form de edição
          setEditForm({
            nome: profileData.nome,
            biografia: profileData.biografia || "",
            url_foto: profileData.url_foto || "",
            url_capa: profileData.url_capa || "",
            localizacao: profileData.localizacao || ""
          });

        } else {
          // --- VISITANTE: Carrega dados públicos ---
          const [profileData, publicLikes, publicLists, activityData] = await Promise.all([
            getPublicProfile(id!),
            getUserLikes(id!),
            getUserLists(id!),
            activityPromise,
          ]);

          setProfile(profileData);
          setIsFollowing(!!profileData.is_following);
          setFavorites(publicLikes);
          setUserLists(publicLists);
          setRecentActivity(activityData);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user || id) {
      load();
    }
  }, [id, user, isOwner]);

  // --- AÇÕES DO PERFIL ---

  async function handleSaveProfile() {
    try {
      const updated = await updateMyProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao atualizar perfil.");
    }
  }

  async function handleToggleFollow() {
    if (!user) { alert("Faça login para seguir."); return; }

    const oldState = isFollowing;
    setIsFollowing(!oldState);

    // Atualização otimista dos números
    setProfile((prev: any) => ({
      ...prev,
      stats: {
        ...prev.stats,
        followers: oldState ? prev.stats.followers - 1 : prev.stats.followers + 1
      }
    }));

    try { await toggleFollow(id!); } catch (error) { setIsFollowing(oldState); alert("Erro ao seguir."); }
  }

  // --- AÇÕES DE LISTAS ---

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListForm.nome) return;

    try {
      const novaLista = await createLista({
        nome: newListForm.nome,
        descricao: newListForm.descricao,
        publica: true
      });

      setUserLists([novaLista, ...userLists]);
      setIsCreatingList(false);
      setNewListForm({ nome: "", descricao: "" });
    } catch (err) {
      alert("Erro ao criar lista.");
    }
  }

  async function handleDeleteList(listaId: number) {
    if (!confirm("Tem certeza que deseja apagar esta lista permanentemente?")) return;
    try {
      await deleteLista(listaId);
      setUserLists(userLists.filter(l => l.id !== listaId));
    } catch (err) {
      alert("Erro ao deletar lista.");
    }
  }

  // --- RENDER ---

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recentemente";
    const [ano, mes, dia] = dateString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (loading) return <div className="container py-20 text-center">Carregando perfil...</div>;
  if (!profile) return <div className="container py-20 text-center">Usuário não encontrado.</div>;

  const stats = profile.stats || { total_reviews: 0, media_reviews: 0, followers: 0, likes: 0, following: 0 };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20">

      {/* HEADER DO PERFIL */}
      <div className="relative overflow-hidden rounded-lg bg-zinc-900 shadow-xl min-h-[320px]">
        {/* Imagem de Capa */}
        <div className="absolute inset-0">
          {profile.url_capa ? (
            <ImageWithFallback
              src={profile.url_capa}
              alt="Capa"
              className={`w-full h-full object-cover ${isEditing ? 'opacity-40 blur-sm' : 'opacity-80'}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Edição da Capa */}
        {isOwner && isEditing && (
          <div className="absolute top-4 right-4 left-4 z-20">
            <label className="text-xs text-white/70 ml-1">URL da Capa</label>
            <Input className="bg-black/60 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md" value={editForm.url_capa} onChange={e => setEditForm({ ...editForm, url_capa: e.target.value })} />
          </div>
        )}

        <div className="relative z-10 p-8 pt-24 md:pt-32">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <Avatar className="h-32 w-32 border-4 border-black/50 shadow-2xl">
                <AvatarImage src={profile.url_foto} className="object-cover" />
                <AvatarFallback className="text-4xl bg-zinc-800 text-white font-bold">{profile.nome[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {isOwner && isEditing && (
                <div className="absolute -bottom-2 left-0 right-0">
                  <Input placeholder="URL Foto" className="h-6 text-[10px] bg-black/80 border-none text-center text-white" value={editForm.url_foto} onChange={e => setEditForm({ ...editForm, url_foto: e.target.value })} />
                </div>
              )}
            </div>

            {/* Informações Textuais */}
            <div className="flex-1 text-white space-y-4 w-full">
              <div>
                {isOwner && isEditing ? (
                  <div className="space-y-2">
                    <label className="text-xs text-white/70">Nome</label>
                    <Input className="text-2xl font-bold bg-white/10 border-white/20 text-white h-auto py-2" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold drop-shadow-md">{profile.nome}</h1>
                )}

                {isOwner && profile.email && <p className="text-white/70 font-medium">@{profile.email.split('@')[0]}</p>}

                <div className="mt-3">
                  {isOwner && isEditing ? (
                    <div className="space-y-1">
                      <label className="text-xs text-white/70">Biografia</label>
                      <Textarea className="bg-white/10 border-white/20 text-white min-h-[80px]" placeholder="Sua biografia..." value={editForm.biografia} onChange={e => setEditForm({ ...editForm, biografia: e.target.value })} />
                    </div>
                  ) : (
                    <p className="text-white/90 max-w-2xl">{profile.biografia || "Sem biografia."}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {profile.data_cadastro && <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>Membro desde {formatDate(profile.data_cadastro)}</span></div>}
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  {isOwner && isEditing ? (
                    <Input className="h-6 w-32 bg-white/10 border-white/20 text-white text-xs" placeholder="Localização" value={editForm.localizacao} onChange={e => setEditForm({ ...editForm, localizacao: e.target.value })} />
                  ) : (
                    <span>{profile.localizacao || "Localização não definida"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-row gap-2 mt-4 md:mt-0 shrink-0">
              {isOwner ? (
                isEditing ? (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => setIsEditing(false)}><X className="h-4 w-4 mr-2" /> Cancelar</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={handleSaveProfile}><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="bg-black/20 border-white/30 text-white hover:bg-white hover:text-black" onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4 mr-2" /> Editar Perfil</Button>
                )
              ) : (
                <Button onClick={handleToggleFollow} variant={isFollowing ? "secondary" : "default"} className={isFollowing ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-purple-600 hover:bg-purple-700 text-white"}>
                  {isFollowing ? <><UserCheck className="h-4 w-4 mr-2" /> Seguindo</> : <><UserPlus className="h-4 w-4 mr-2" /> Seguir</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{stats.followers || 0}</div><div className="text-sm text-muted-foreground">Seguidores</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{stats.following !== undefined ? stats.following : "-"}</div><div className="text-sm text-muted-foreground">Seguindo</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{stats.total_reviews || 0}</div><div className="text-sm text-muted-foreground">Avaliações</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{stats.likes || 0}</div><div className="text-sm text-muted-foreground">Curtidas</div></CardContent></Card>
      </div>

      {/* ABAS DE CONTEÚDO */}
      <Tabs defaultValue="favorites" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-4 w-full">
          <TabsTrigger value="favorites" className="flex items-center space-x-2"><Heart className="h-4 w-4" /><span>Favoritas</span></TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center space-x-2"><List className="h-4 w-4" /><span>Listas</span></TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2"><Music className="h-4 w-4" /><span>Atividade</span></TabsTrigger>
        </TabsList>

        {/* ABA: FAVORITAS */}
        <TabsContent value="favorites" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{isOwner ? "Músicas Favoritas" : `Favoritas de ${profile.nome}`}</h2>
            {!isOwner && favorites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma música favoritada.</div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-zinc-900/50 border-dashed border-zinc-700"><Heart className="h-12 w-12 mx-auto text-zinc-600 mb-3" /><p className="text-muted-foreground">Você ainda não curtiu nenhuma música.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((music) => (
                  <MusicCard key={music.id} id={music.id} title={music.nome} artist={music.artista} album={music.album} coverImage={music.url_imagem} year={getSafeYear(music.data_lancamento)} userRating={music.user_rating} rating={0} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA: LISTAS */}
        <TabsContent value="lists" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{isOwner ? "Minhas Listas" : `Listas de ${profile.nome}`}</h2>
              {isOwner && !isCreatingList && (
                <Button size="sm" onClick={() => setIsCreatingList(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Nova Lista
                </Button>
              )}
            </div>

            {/* Formulário de Nova Lista */}
            {isOwner && isCreatingList && (
              <Card className="mb-6 border-purple-500/50 bg-purple-900/10">
                <CardHeader><CardTitle className="text-lg">Criar Nova Lista</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateList} className="space-y-4">
                    <div>
                      <Input placeholder="Nome da Lista" value={newListForm.nome} onChange={e => setNewListForm({ ...newListForm, nome: e.target.value })} autoFocus />
                    </div>
                    <div>
                      <Input placeholder="Descrição (Opcional)" value={newListForm.descricao} onChange={e => setNewListForm({ ...newListForm, descricao: e.target.value })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="ghost" onClick={() => setIsCreatingList(false)}>Cancelar</Button>
                      <Button type="submit" disabled={!newListForm.nome}>Criar Lista</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Grid de Listas */}
            {userLists.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Nenhuma lista encontrada.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userLists.map((list) => (
                  <Card
                    key={`list-${list.id}`}
                    className="group cursor-pointer hover:shadow-lg transition-shadow bg-zinc-900 border-zinc-800"

                    onClick={() => navigate(`/listas/${list.id}`)}
                  >
                    <CardContent className="p-0 relative">
                      {/* Botão Deletar (Só para o dono) */}
                      {isOwner && (
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteList(list.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="aspect-video overflow-hidden rounded-t-lg bg-zinc-950 flex items-center justify-center">
                        {list.url_capa ? (
                          <ImageWithFallback src={list.url_capa} alt={list.nome} className="h-full w-full object-cover" />
                        ) : (
                          <List className="h-12 w-12 text-zinc-700" />
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate text-lg">{list.nome}</h3>
                          <Badge variant="secondary" className="text-xs">{list.song_count} músicas</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{list.descricao || "Sem descrição."}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA: ATIVIDADE */}
        <TabsContent value="activity" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isOwner ? "Nenhuma atividade recente registrada." : `Nenhuma atividade recente para ${profile.nome}.`}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const icon = activity.tipo === 'review'
                        ? <MessageCircle className="h-5 w-5 text-purple-400" />
                        : <List className="h-5 w-5 text-blue-400" />;

                      const targetLink = activity.tipo === 'review'
                        ? `/musicas/${activity.target_id}`
                        : `/listas/${activity.target_id}`;

                      return (
                        <Link
                          key={activity.id}
                          to={targetLink}
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-900 hover:border-purple-600/50"
                        >
                          {/* Ícone de Atividade */}
                          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            {icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="flex items-start text-base"> 
                              <span className="font-medium truncate flex-1 min-w-0">{activity.acao}</span>                              
                            </p>
                            {activity.comentario && (
                              <p className="text-sm text-muted-foreground truncate italic pt-0.5">"{activity.comentario}"</p>
                            )}

                            {activity.nota !== undefined && activity.nota !== null && (
                                <span className="inline-block shrink-0"> 
                                  <StarRating rating={activity.nota} size="sm" />
                                </span>
                              )}
                          </div>
                          {/* <p className="text-xs text-zinc-500 shrink-0">
                            {activity.data_criacao.split(' ')[0]} 
                          </p> */}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}