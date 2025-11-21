import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Rotas
import { useAuth } from "../contexts/AuthContext"; // Autenticação
import {
  ArrowLeft, Heart, List, Play, Share2, MessageCircle,
  Clock, Calendar, Disc, User, Star
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Importa funções da API
import { 
  getMusica, getReviews, createReview, getRating,
  type Musica, type Review 
} from "../lib/api";

export default function MusicDetail() {
  const { id } = useParams(); // Pega o ID da URL (/musicas/1)
  const navigate = useNavigate();
  const { user } = useAuth(); // Pega usuário logado

  // Estados de Dados
  const [m, setM] = useState<Musica | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ media: 0, qtde: 0 });
  
  // Estados de UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados do Formulário de Review
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);

  // Carrega dados iniciais
  useEffect(() => {
    if (!id) return;

    let cancel = false;
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        // Fazemos as 3 chamadas em paralelo para ser mais rápido
        const [musicData, reviewsData, ratingData] = await Promise.all([
          getMusica(id!),
          getReviews(id!),
          getRating(id!)
        ]);

        if (!cancel) {
          setM(musicData);
          setReviews(reviewsData);
          setStats({ 
             media: ratingData.media || 0, 
             qtde: ratingData.qtde 
          });
        }
      } catch (e: any) {
        if (!cancel) setError(e.message || "Erro ao carregar dados.");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    loadAll();
    return () => { cancel = true; };
  }, [id]);

  // Função para enviar Review
  async function handlePostReview() {
    if (!id || newRating === 0) {
      alert("Por favor, dê uma nota antes de enviar.");
      return;
    }

    setSubmitting(true);
    try {
      // Envia para a API
      const createdReview = await createReview(id, {
        nota: newRating,
        comentario: newComment
      });

      // Atualiza a lista na tela sem precisar recarregar tudo
      setReviews([createdReview, ...reviews]); 
      
      // Reseta o formulário
      setNewComment("");
      setNewRating(0);
      
      // Opcional: Atualizar a média localmente (simplificado) ou refazer o fetch do rating
      setStats(prev => ({
         qtde: prev.qtde + 1,
         media: ((prev.media * prev.qtde) + createdReview.nota) / (prev.qtde + 1)
      }));

    } catch (err: any) {
      alert(err.message || "Erro ao enviar review.");
    } finally {
      setSubmitting(false);
    }
  }

  // Placeholders visuais
  const coverImage = "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?q=80&w=1080&auto=format&fit=crop";
  const genre = "Gênero";
  const year = "—";

  if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;
  if (error || !m) return <div className="p-8 text-center text-red-500">{error ?? "Música não encontrada."}</div>;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header de Voltar (Agora dentro da página, já que removemos o App.tsx complexo) */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Início</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Capa */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg shadow-2xl bg-zinc-900">
              <ImageWithFallback
                src={coverImage}
                alt={`${m.nome} cover`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Play className="h-5 w-5 mr-2" />
                Reproduzir
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="secondary">{genre}</Badge>
              <h1 className="text-4xl font-bold">{m.nome}</h1>
              <p className="text-xl text-muted-foreground">por {m.artista}</p>
              <p className="text-lg text-muted-foreground">
                {m.album} • {m.duracao}
              </p>
            </div>

            {/* Rating Geral */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <div className="text-center">
                    <span className="block text-3xl font-bold text-purple-400">
                        {stats.media ? stats.media.toFixed(1) : "-"}
                    </span>
                    <span className="text-xs text-muted-foreground">Média</span>
                </div>
                <div className="h-10 w-[1px] bg-zinc-700"></div>
                <div>
                    <StarRating rating={stats.media || 0} size="lg" />
                    <span className="text-sm text-muted-foreground block mt-1">
                    ({stats.qtde} avaliações)
                    </span>
                </div>
              </div>
            </div>

            {/* Detalhes Técnicos */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" /> <span>{m.duracao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Disc className="h-4 w-4" /> <span>{m.album}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" /> <span>{m.artista}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> <span>{year}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Avaliações */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Avaliações da Comunidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Formulário de Nova Avaliação */}
            <div className="bg-zinc-900/30 p-6 rounded-lg border border-zinc-800/50">
              {user ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-purple-300">Escreva sua avaliação como {user.nome}</h4>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">Sua nota:</span>
                    <StarRating 
                        rating={newRating} 
                        size="md" 
                        interactive 
                        onRatingChange={setNewRating} 
                    />
                  </div>

                  <Textarea
                    placeholder="O que você achou desta música? (Opinião sincera!)"
                    className="min-h-[100px] bg-zinc-950"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button 
                    onClick={handlePostReview} 
                    disabled={submitting || newRating === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submitting ? "Enviando..." : "Publicar Avaliação"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                    <p className="text-muted-foreground">Faça login para avaliar esta música.</p>
                    <Link to="/login">
                        <Button variant="outline">Fazer Login</Button>
                    </Link>
                </div>
              )}
            </div>

            <Separator />

            {/* Lista de Reviews */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                      Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                  </p>
              ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10 border border-purple-500/20">
                          {/* Usamos a inicial do nome como avatar já que o back não tem imagem de perfil ainda */}
                          <AvatarFallback className="bg-zinc-800 text-purple-400 font-bold">
                             {review.autor ? review.autor[0].toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2 bg-zinc-900/50 p-4 rounded-lg rounded-tl-none border border-zinc-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-200">{review.autor || "Usuário Desconhecido"}</span>
                            <StarRating rating={review.nota} size="sm" />
                          </div>
                          
                          <p className="text-zinc-300 leading-relaxed">{review.comentario}</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}