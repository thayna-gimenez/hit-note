import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Heart, List, Music, Save, X, Edit2, MapPin, UserPlus, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { MusicCard } from "./music-card";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Integração com API e Contexto
import { useAuth } from "../contexts/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  getMyLikes,
  getPublicProfile,
  toggleFollow,
  getUserLikes,
  type UsuarioFull,
  type Musica
} from "../lib/api";

// --- DADOS MOCKADOS ---
const userLists = [
  {
    id: "list1",
    name: "Rock Clássico Essencial",
    description: "As melhores do rock clássico que todo mundo deveria conhecer",
    songCount: 25,
    isPublic: true,
    createdAt: "2024-01-15",
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?q=80&w=1080"
  },
  {
    id: "list2",
    name: "Descobertas de 2024",
    description: "Novas músicas que descobri este ano",
    songCount: 18,
    isPublic: true,
    createdAt: "2024-01-01",
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?q=80&w=1080"
  }
];

const recentActivity = [
  {
    id: "act1",
    type: "rating",
    action: "Avaliou",
    target: "Hotel California - Eagles",
    rating: 5,
    date: "2 horas atrás"
  },
  {
    id: "act2",
    type: "like",
    action: "Curtiu",
    target: "Stairway to Heaven - Led Zeppelin",
    date: "1 dia atrás"
  }
];

// --- COMPONENTE PRINCIPAL ---

export function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwner = !id || (user && String(user.id) === id);

  // Estados de Dados
  const [profile, setProfile] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Seguir (Visitante)
  const [isFollowing, setIsFollowing] = useState(false);

  // Estados de Edição (Dono)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    biografia: "",
    url_foto: "",
    url_capa: "",
    localizacao: ""
  });

  // Função auxiliar para data
  const getSafeYear = (dateString?: string) => {
    if (!dateString) return undefined;
    const yearPart = dateString.split('-')[0];
    const year = parseInt(yearPart);
    if (isNaN(year)) return undefined;
    return year;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        if (isOwner) {
          // --- MODO DONO: Carrega meu perfil e meus likes ---
          if (!user) return;
          const [profileData, favoritesData] = await Promise.all([
            getMyProfile(),
            getMyLikes()
          ]);

          setProfile(profileData);
          setFavorites(favoritesData);

          setEditForm({
            nome: profileData.nome,
            biografia: profileData.biografia || "",
            url_foto: profileData.url_foto || "",
            url_capa: profileData.url_capa || "",
            localizacao: profileData.localizacao || ""
          });

        } else {
          // --- MODO VISITANTE: Carrega perfil público ---
          const [profileData, publicLikes] = await Promise.all([
            getPublicProfile(id!),
            getUserLikes(id!) 
          ]);

          setProfile(profileData);
          setIsFollowing(!!profileData.is_following);

          setFavorites(publicLikes);
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

  async function handleSave() {
    try {
      const updated = await updateMyProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao atualizar perfil.");
    }
  }

  async function handleToggleFollow() {
    if (!user) {
      alert("Faça login para seguir.");
      return;
    }

    const oldState = isFollowing;
    setIsFollowing(!oldState);

    setProfile((prev: any) => ({
      ...prev,
      stats: {
        ...prev.stats,
        followers: oldState ? prev.stats.followers - 1 : prev.stats.followers + 1
      }
    }));

    try {
      await toggleFollow(id!);
    } catch (error) {
      setIsFollowing(oldState);
      alert("Erro ao seguir usuário.");
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recentemente";
    const [ano, mes, dia] = dateString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (loading) return <div className="container py-20 text-center">Carregando perfil...</div>;
  if (!profile) return <div className="container py-20 text-center">Usuário não encontrado.</div>;

  // Defesa contra crash
  const stats = profile.stats || { total_reviews: 0, media_reviews: 0, followers: 0, likes: 0 };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20">

      {/* --- HEADER DO PERFIL --- */}
      <div className="relative overflow-hidden rounded-lg bg-zinc-900 shadow-xl min-h-[320px]">

        {/* Capa */}
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

        {/* Input de Capa (Apenas Dono Editando) */}
        {isOwner && isEditing && (
          <div className="absolute top-4 right-4 left-4 z-20">
            <label className="text-xs text-white/70 ml-1">URL da Capa</label>
            <Input
              placeholder="URL da Capa"
              className="bg-black/60 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
              value={editForm.url_capa}
              onChange={e => setEditForm({ ...editForm, url_capa: e.target.value })}
            />
          </div>
        )}

        {/* Conteúdo do Header */}
        <div className="relative z-10 p-8 pt-24 md:pt-32">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">

            {/* Avatar */}
            <div className="relative group shrink-0">
              <Avatar className="h-32 w-32 border-4 border-black/50 shadow-2xl">
                <AvatarImage src={profile.url_foto} className="object-cover" />
                <AvatarFallback className="text-4xl bg-zinc-800 text-white font-bold">
                  {profile.nome[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Input de Avatar (Apenas Dono Editando) */}
              {isOwner && isEditing && (
                <div className="absolute -bottom-2 left-0 right-0">
                  <Input
                    placeholder="URL Foto"
                    className="h-6 text-[10px] bg-black/80 border-none text-center text-white"
                    value={editForm.url_foto}
                    onChange={e => setEditForm({ ...editForm, url_foto: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Info do Usuário */}
            <div className="flex-1 text-white space-y-4 w-full">
              <div>
                {isOwner && isEditing ? (
                  <div className="space-y-2">
                    <label className="text-xs text-white/70">Nome</label>
                    <Input
                      className="text-2xl font-bold bg-white/10 border-white/20 text-white h-auto py-2"
                      value={editForm.nome}
                      onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold drop-shadow-md">{profile.nome}</h1>
                )}

                {/* Email só mostramos se for o dono (privacidade) */}
                {isOwner && profile.email && (
                  <p className="text-white/70 font-medium">@{profile.email.split('@')[0]}</p>
                )}

                <div className="mt-3">
                  {isOwner && isEditing ? (
                    <div className="space-y-1">
                      <label className="text-xs text-white/70">Biografia</label>
                      <Textarea
                        className="bg-white/10 border-white/20 text-white min-h-[80px]"
                        placeholder="Sua biografia..."
                        value={editForm.biografia}
                        onChange={e => setEditForm({ ...editForm, biografia: e.target.value })}
                      />
                    </div>
                  ) : (
                    <p className="text-white/90 max-w-2xl">{profile.biografia || "Sem biografia."}</p>
                  )}
                </div>
              </div>

              {/* Metadados */}
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {profile.data_cadastro && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {formatDate(profile.data_cadastro)}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  {isOwner && isEditing ? (
                    <Input
                      className="h-6 w-32 bg-white/10 border-white/20 text-white text-xs"
                      placeholder="Localização"
                      value={editForm.localizacao}
                      onChange={e => setEditForm({ ...editForm, localizacao: e.target.value })}
                    />
                  ) : (
                    <span>{profile.localizacao || "Localização não definida"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* --- BOTÕES DE AÇÃO (Lógica Principal) --- */}
            <div className="flex flex-row gap-2 mt-4 md:mt-0 shrink-0">

              {isOwner ? (
                // BOTÕES DO DONO (Editar/Salvar)
                isEditing ? (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" /> Cancelar
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" /> Salvar
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="bg-black/20 border-white/30 text-white hover:bg-white hover:text-black" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Editar Perfil
                  </Button>
                )
              ) : (
                // BOTÃO DO VISITANTE (Seguir)
                <Button
                  onClick={handleToggleFollow}
                  variant={isFollowing ? "secondary" : "default"}
                  className={isFollowing ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-purple-600 hover:bg-purple-700 text-white"}
                >
                  {isFollowing ? (
                    <> <UserCheck className="h-4 w-4 mr-2" /> Seguindo </>
                  ) : (
                    <> <UserPlus className="h-4 w-4 mr-2" /> Seguir </>
                  )}
                </Button>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* --- ESTATÍSTICAS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.followers || 0}</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.following !== undefined ? stats.following : "-"}</div>
            <div className="text-sm text-muted-foreground">Seguindo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_reviews || 0}</div>
            <div className="text-sm text-muted-foreground">Avaliações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.likes || 0}</div>
            <div className="text-sm text-muted-foreground">Curtidas</div>
          </CardContent>
        </Card>
      </div>

      {/* --- ABAS --- */}
      <Tabs defaultValue="favorites" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-4 w-full">
          <TabsTrigger value="favorites" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Favoritas</span>
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Listas</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Music className="h-4 w-4" />
            <span>Atividade</span>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba Favoritos */}
        <TabsContent value="favorites" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {isOwner ? "Músicas Favoritas" : `Favoritas de ${profile.nome}`}
            </h2>

            {/* Se for visitante, podemos não mostrar nada por enquanto ou mostrar mensagem */}
            {!isOwner && favorites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                As favoritas deste usuário são privadas ou vazias.
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-zinc-900/50 border-dashed border-zinc-700">
                <Heart className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                <p className="text-muted-foreground">Você ainda não curtiu nenhuma música.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((music) => (
                  <MusicCard
                    key={music.id}
                    id={music.id}
                    title={music.nome}
                    artist={music.artista}
                    album={music.album}
                    coverImage={music.url_imagem}
                    year={getSafeYear(music.data_lancamento)}
                    userRating={music.user_rating}
                    rating={0}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Conteúdo da Aba Listas e Atividade (Mockados) */}
        <TabsContent value="lists" className="space-y-6">
          {/* ... Código das listas ... */}
          <div className="text-center py-8 text-muted-foreground">Listas em breve...</div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* ... Código das atividades ... */}
          <div className="text-center py-8 text-muted-foreground">Atividade em breve...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}