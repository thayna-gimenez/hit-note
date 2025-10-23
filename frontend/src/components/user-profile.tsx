import { Calendar, Heart, List, Music, Play, Settings, Users } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { MusicCard } from "./music-card"
import { StarRating } from "./star-rating"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface UserProfileProps {
  onMusicClick: (musicId: string) => void
}

// Mock user data
const userData = {
  id: "user1",
  name: "João Silva",
  username: "joaomusic",
  avatar: "https://images.unsplash.com/photo-1585972949678-b7eff107d061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhciUyMG11c2ljaWFufGVufDF8fHx8MTc1ODU3MjI5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  bio: "Apaixonado por música de todos os gêneros. Sempre buscando novos sons e compartilhando descobertas musicais.",
  joinDate: "Janeiro 2022",
  location: "São Paulo, Brasil",
  stats: {
    totalRatings: 247,
    avgRating: 4.2,
    followers: 156,
    following: 89,
    listsCreated: 12,
    songsLiked: 1.4
  }
}

const favoriteMusics = [
  {
    id: "fav1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    year: 1975,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    userRating: 5,
    genre: "Rock",
    duration: "5:55",
    isLiked: true
  },
  {
    id: "fav2",
    title: "Paranoid Android",
    artist: "Radiohead",
    album: "OK Computer",
    year: 1997,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    userRating: 5,
    genre: "Alternative",
    duration: "6:23",
    isLiked: true
  },
  {
    id: "fav3",
    title: "Purple Haze",
    artist: "Jimi Hendrix",
    album: "Are You Experienced",
    year: 1967,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    userRating: 5,
    genre: "Psychedelic Rock",
    duration: "2:50",
    isLiked: true
  },
  {
    id: "fav4",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    year: 1982,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    userRating: 5,
    genre: "Pop",
    duration: "4:54",
    isLiked: true
  }
]

const userLists = [
  {
    id: "list1",
    name: "Rock Clássico Essencial",
    description: "As melhores do rock clássico que todo mundo deveria conhecer",
    songCount: 25,
    isPublic: true,
    createdAt: "2024-01-15",
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "list2",
    name: "Descobertas de 2024",
    description: "Novas músicas que descobri este ano",
    songCount: 18,
    isPublic: true,
    createdAt: "2024-01-01",
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "list3",
    name: "Para Relaxar",
    description: "Músicas calmas para momentos de tranquilidade",
    songCount: 32,
    isPublic: false,
    createdAt: "2023-12-10",
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
]

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
  },
  {
    id: "act3",
    type: "list",
    action: "Criou a lista",
    target: "Descobertas de 2024",
    date: "3 dias atrás"
  },
  {
    id: "act4",
    type: "rating",
    action: "Avaliou",
    target: "Imagine - John Lennon",
    rating: 4,
    date: "5 dias atrás"
  }
]

export function UserProfile({ onMusicClick }: UserProfileProps) {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-white/20">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="text-2xl">{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-white space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <p className="text-white/80">@{userData.username}</p>
                <p className="text-white/90 mt-2">{userData.bio}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {userData.joinDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📍 {userData.location}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="secondary" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Seguir
                </Button>
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-black">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userData.stats.totalRatings}</div>
            <div className="text-sm text-muted-foreground">Avaliações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="text-2xl font-bold text-primary">{userData.stats.avgRating}</span>
              <StarRating rating={userData.stats.avgRating} size="sm" />
            </div>
            <div className="text-sm text-muted-foreground">Média</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userData.stats.followers}</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userData.stats.songsLiked}k</div>
            <div className="text-sm text-muted-foreground">Curtidas</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Content */}
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

        <TabsContent value="favorites" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Músicas Favoritas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favoriteMusics.map((music) => (
                <MusicCard
                  key={music.id}
                  {...music}
                  onPlay={() => console.log(`Playing ${music.title}`)}
                  onLike={() => console.log(`Liked ${music.title}`)}
                  onRate={(rating) => console.log(`Rated ${music.title}: ${rating} stars`)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

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
                            <span className="ml-2">
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
  )
}