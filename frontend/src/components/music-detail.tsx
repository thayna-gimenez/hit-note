import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; 
import { useAuth } from "../contexts/AuthContext"; 
import {
  ArrowLeft, Heart, Play, Share2, MessageCircle,
  Calendar, Disc, User, Plus
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { StarRating } from "./star-rating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import { 
  getMusica, getReviews, createReview, getRating,
  getLikeStatus, toggleLike, 
  type Musica, type Review 
} from "../lib/api";

export default function MusicDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [m, setM] = useState<Musica | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ media: 0, qtde: 0 });
  
  const [isLiked, setIsLiked] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancel = false;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

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

        if (user) {
           try {
             const status = await getLikeStatus(id!);
             if (!cancel) setIsLiked(status);
           } catch (err) {
             console.error("Erro ao verificar like:", err);
           }
        }

      } catch (e: any) {
        if (!cancel) setError(e.message || "Erro ao carregar dados.");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    loadAll();
    return () => { cancel = true; };
  }, [id, user]);

  async function handleToggleLike() {
    if (!user) {
        alert("Você precisa estar logado para favoritar!");
        return;
    }
    if (!id) return;

    try {
        const novoStatus = await toggleLike(id);
        setIsLiked(novoStatus);
    } catch (error) {
        console.error("Erro ao dar like", error);
        alert("Não foi possível favoritar no momento.");
    }
  }

  async function handlePostReview() {
    if (!id || newRating === 0) {
      alert("Por favor, dê uma nota antes de enviar.");
      return;
    }

    setSubmitting(true);
    try {
      const createdReview = await createReview(id, {
        nota: newRating,
        comentario: newComment
      });

      setReviews([createdReview, ...reviews]); 
      setNewComment("");
      setNewRating(0);
      
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

  const defaultCover = "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?q=80&w=1080";
  const displayImage = m?.url_imagem || defaultCover;
  const releaseDate = m?.data_lancamento || "—";

  if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;
  if (error || !m) return <div className="p-8 text-center text-red-500">{error ?? "Música não encontrada."}</div>;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Início</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Capa */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg shadow-2xl bg-zinc-900">
              <ImageWithFallback
                src={displayImage} 
                alt={`${m.nome} cover`}
                className="h-full w-full object-cover"
              />
            </div>

          </div>

          {/* Informações Principais */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{m.nome}</h1>
              <p className="text-xl text-muted-foreground">por {m.artista}</p>
              <p className="text-lg text-muted-foreground">
                {m.album}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Disc className="h-4 w-4" /> 
                    <span className="truncate" title={m.album}>Álbum: {m.album}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" /> 
                    <span className="truncate" title={m.artista}>Artista: {m.artista}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> 
                    <span>Lançamento: {releaseDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center space-x-3">
              
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleToggleLike}
                className="transition-all"
              >
                <Heart 
                    fill={isLiked ? "#9333ea" : "none"} 
                    className={`h-5 w-5 transition-colors ${isLiked ? "text-purple-600" : "text-zinc-400"}`} 
                />
              </Button>

              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
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
                    variant="outline"
                    onClick={handlePostReview} 
                    disabled={submitting || newRating === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold disabled:opacity-70 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
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