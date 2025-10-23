import { useEffect, useState } from "react";
import {
  ArrowLeft, Heart, List, Play, Share2, MessageCircle,
  Clock, Calendar, Disc, User
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getMusica, type Musica } from "../lib/api";

interface MusicDetailProps {
  musicId: string;
  onBack: () => void;
}

// --- mocks temporários para seções que ainda não existem no backend ---
const reviews = [
  {
    id: "rev1",
    user: {
      name: "Maria Santos",
      username: "mariasantos",
      avatar:
        "https://images.unsplash.com/photo-1585972949678-b7eff107d061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    rating: 5,
    comment:
      "Simplesmente uma das maiores músicas de todos os tempos! A forma como o Freddie Mercury conduz a narrativa é genial.",
    date: "2024-01-15",
    likes: 23,
  },
  {
    id: "rev2",
    user: {
      name: "Carlos Silva",
      username: "carlosmusic",
      avatar:
        "https://images.unsplash.com/photo-1585972949678-b7eff107d061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    rating: 5,
    comment:
      "Cada vez que escuto descubro algo novo. Uma verdadeira obra de arte musical.",
    date: "2024-01-12",
    likes: 15,
  },
];

const relatedSongs = [
  {
    id: "rel1",
    title: "We Will Rock You",
    artist: "Queen",
    coverImage:
      "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2:02",
    rating: 4.7,
  },
  {
    id: "rel2",
    title: "Somebody to Love",
    artist: "Queen",
    coverImage:
      "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "4:56",
    rating: 4.6,
  },
];

export function MusicDetail({ musicId, onBack }: MusicDetailProps) {
  const [m, setM] = useState<Musica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // carrega a música real do backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    getMusica(musicId)
      .then(setM)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [musicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">Carregando…</div>
      </div>
    );
  }

  if (error || !m) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 text-red-500">
          {error ?? "Música não encontrada."}
        </div>
      </div>
    );
  }

  // campos que o backend AINDA não tem (capa/ano/gênero/rating etc.)
  const coverImage =
    "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?q=80&w=1080&auto=format&fit=crop";
  const genre = "Gênero";
  const year = "—";
  const rating = 4.6;
  const totalRatings = 127;
  const userRating = 5;
  const isLiked = true;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Album Cover */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg shadow-2xl">
              <ImageWithFallback
                src={coverImage}
                alt={`${m.nome} cover`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button size="lg" className="flex-1">
                <Play className="h-5 w-5 mr-2" />
                Reproduzir
              </Button>
              <Button size="lg" variant={isLiked ? "default" : "outline"}>
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="lg" variant="outline">
                <List className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Music Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="secondary">{genre}</Badge>
              <h1 className="text-4xl font-bold">{m.nome}</h1>
              <p className="text-xl text-muted-foreground">por {m.artista}</p>
              <p className="text-lg text-muted-foreground">
                {m.album} • {year}
              </p>
            </div>

            {/* Rating (placeholder até termos reviews reais) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <StarRating rating={rating} size="lg" />
                <span className="text-lg font-medium">{rating}/5</span>
                <span className="text-sm text-muted-foreground">
                  ({totalRatings} avaliações)
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm">Sua avaliação:</p>
                <StarRating
                  rating={userRating}
                  size="md"
                  interactive
                  onRatingChange={(r) => console.log(`New rating: ${r}`)}
                />
              </div>
            </div>

            {/* Stats (placeholders) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">2.4M</div>
                <div className="text-sm text-muted-foreground">Reproduções</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">847</div>
                <div className="text-sm text-muted-foreground">Curtidas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">324</div>
                <div className="text-sm text-muted-foreground">Em Listas</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Sobre a música</h3>
              <p className="text-muted-foreground leading-relaxed">
                Em breve: descrição, gênero e notas vindas do backend. Por enquanto,
                você já vê nome/álbum/artista/duração reais.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Duração:</span>
                  <span>{m.duracao}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Lançamento:</span>
                  <span>{year}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Disc className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Gravadora:</span>
                  <span>—</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Produtor:</span>
                  <span>—</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">Compositores:</span>
                  <span>—</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Songs (mock) */}
        <Card>
          <CardHeader>
            <CardTitle>Mais de {m.artista}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="text-sm text-muted-foreground w-6">{index + 1}</div>
                  <div className="h-12 w-12 rounded overflow-hidden">
                    <ImageWithFallback
                      src={song.coverImage}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                  <StarRating rating={song.rating} size="sm" />
                  <span className="text-sm text-muted-foreground">{song.duration}</span>
                  <Button size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews (mock) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Avaliações da Comunidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Review (ainda não ligado ao backend) */}
            <div className="space-y-3">
              <h4 className="font-medium">Escreva sua avaliação</h4>
              <Textarea
                placeholder="O que você achou desta música?"
                className="min-h-[100px]"
              />
              <Button>Publicar Avaliação</Button>
            </div>

            <Separator />

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                      <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          @{review.user.username}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(review.date).toLocaleDateString("pt-BR")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-muted-foreground"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {review.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
