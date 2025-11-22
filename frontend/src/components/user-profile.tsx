import { useEffect, useState } from "react";
import { Calendar, Heart, List, Music, Save, X, Edit2, MapPin } from "lucide-react";
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
  const { user } = useAuth();

  // Estados de Dados Reais
  const [profile, setProfile] = useState<UsuarioFull | null>(null);
  
  // Estado para as favoritas
  const [favorites, setFavorites] = useState<Musica[]>([]);

  const [loading, setLoading] = useState(true);

  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    biografia: "",
    url_foto: "",
    url_capa: "",
    localizacao: ""
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        const [profileData, favoritesData] = await Promise.all([
            getMyProfile(),
            getMyLikes()
        ]);

        console.log("Perfil carregado:", profileData);
        console.log("Favoritas carregadas:", favoritesData);

        setProfile(profileData);
        setFavorites(favoritesData);

        setEditForm({
          nome: profileData.nome,
          biografia: profileData.biografia || "",
          url_foto: profileData.url_foto || "",
          url_capa: profileData.url_capa || "",
          localizacao: profileData.localizacao || ""
        });

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  async function handleSave() {
    try {
      const updated = await updateMyProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao atualizar perfil. Verifique os dados.");
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recentemente";
    const [ano, mes, dia] = dateString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (!user) return <div className="container py-8 text-center">Faça login para ver seu perfil.</div>;
  if (loading) return <div className="container py-8 text-center">Carregando...</div>;
  if (!profile) return <div className="container py-8 text-center">Erro ao carregar dados do perfil.</div>;

  // Defesa contra crash: Se stats vier undefined, usamos valores padrão
  const stats = profile.stats || { total_reviews: 0, media_reviews: 0, followers: 0, likes: 0 };
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* --- HEADER DO PERFIL (Área Editável) --- */}
      <div className="relative overflow-hidden rounded-lg bg-zinc-900 shadow-xl min-h-[320px]">
        
        {/* Capa de Fundo (Imagem ou Gradiente) */}
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

        {/* Input de Capa (Só aparece editando) */}
        {isEditing && (
            <div className="absolute top-4 right-4 left-4 z-20">
                <label className="text-xs text-white/70 ml-1">URL da Capa</label>
                <Input 
                    placeholder="Cole a URL da imagem de capa aqui..." 
                    className="bg-black/60 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                    value={editForm.url_capa}
                    onChange={e => setEditForm({...editForm, url_capa: e.target.value})}
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
              
              {/* Input de Avatar (Overlay) */}
              {isEditing && (
                 <div className="absolute -bottom-2 left-0 right-0">
                    <Input 
                        placeholder="URL Foto" 
                        className="h-6 text-[10px] bg-black/80 border-none text-center text-white"
                        value={editForm.url_foto}
                        onChange={e => setEditForm({...editForm, url_foto: e.target.value})}
                    />
                 </div>
              )}
            </div>

            {/* Info do Usuário */}
            <div className="flex-1 text-white space-y-4 w-full">
              <div>
                {isEditing ? (
                    <div className="space-y-2">
                        <label className="text-xs text-white/70">Nome</label>
                        <Input 
                            className="text-2xl font-bold bg-white/10 border-white/20 text-white h-auto py-2"
                            value={editForm.nome}
                            onChange={e => setEditForm({...editForm, nome: e.target.value})}
                        />
                    </div>
                ) : (
                    <h1 className="text-3xl font-bold drop-shadow-md">{profile.nome}</h1>
                )}
                
                <p className="text-white/70 font-medium">@{profile.email.split('@')[0]}</p>
                
                <div className="mt-3">
                    {isEditing ? (
                         <div className="space-y-1">
                            <label className="text-xs text-white/70">Biografia</label>
                            <Textarea 
                                className="bg-white/10 border-white/20 text-white min-h-[80px]"
                                placeholder="Sua biografia..."
                                value={editForm.biografia}
                                onChange={e => setEditForm({...editForm, biografia: e.target.value})}
                            />
                         </div>
                    ) : (
                        <p className="text-white/90 max-w-2xl">{profile.biografia || "Sem biografia."}</p>
                    )}
                </div>
              </div>

              {/* Metadados Fixos */}
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {formatDate(profile.data_cadastro)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  {isEditing ? (
                      <Input 
                        className="h-6 w-32 bg-white/10 border-white/20 text-white text-xs"
                        placeholder="Localização"
                        value={editForm.localizacao}
                        onChange={e => setEditForm({...editForm, localizacao: e.target.value})}
                      />
                  ) : (
                      <span>{profile.localizacao || "Localização não definida"}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex flex-row gap-2 mt-4 md:mt-0 shrink-0">
                {isEditing ? (
                    <>
                        <Button variant="destructive" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" /> Salvar
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" size="sm" className="bg-black/20 border-white/30 text-white hover:bg-white hover:text-black" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Editar Perfil
                        </Button>
                    </>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ESTATÍSTICAS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.stats.total_reviews}</div>
            <div className="text-sm text-muted-foreground">Avaliações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="text-2xl font-bold text-primary">{profile.stats.media_reviews.toFixed(1)}</span>
              <StarRating rating={profile.stats.media_reviews} size="sm" />
            </div>
            <div className="text-sm text-muted-foreground">Média</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.stats.followers}</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.stats.likes}</div>
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
            <h2 className="text-xl font-semibold mb-4">Músicas Favoritas</h2>
            
            {favorites.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-zinc-900/50 border-dashed border-zinc-700">
                    <Heart className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                    <p className="text-muted-foreground">Você ainda não curtiu nenhuma música.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {favorites.map((music) => (
                    <MusicCard
                        key={music.id}
                        id={music.id}
                        title={music.nome}
                        artist={music.artista}
                        album={music.album}
                        coverImage={music.url_imagem}
                        // year={music.data_lancamento ? parseInt(music.data_lancamento.split('-')[0]) : undefined}
                        userRating={music.user_rating} 
                        rating={0}
                    />
                ))}
                </div>
            )}
          </div>
        </TabsContent>

        {/* Conteúdo da Aba Listas (MOCKADO) */}
        <TabsContent value="lists" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Minhas Listas</h2>
              <Button size="sm">
                <List className="h-4 w-4 mr-2" />
                Nova Lista
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userLists.map((list) => (
                <Card key={list.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <ImageWithFallback
                        src={list.coverImage}
                        alt={list.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{list.name}</h3>
                        <Badge variant={list.isPublic ? "default" : "secondary"} className="text-xs">
                          {list.isPublic ? "Pública" : "Privada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{list.songCount} músicas</span>
                        <span>{new Date(list.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Conteúdo da Aba Atividade (MOCKADO) */}
        <TabsContent value="activity" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.type === 'rating' && <StarRating rating={1} size="sm" />}
                        {activity.type === 'like' && <Heart className="h-4 w-4 text-red-500" />}
                        {activity.type === 'list' && <List className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p>
                          <span className="font-medium">{activity.action}</span>{" "}
                          <span className="text-muted-foreground">{activity.target}</span>
                          {activity.rating && (
                            <span className="ml-2 inline-block">
                              <StarRating rating={activity.rating} size="sm" />
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}