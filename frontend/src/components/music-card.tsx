import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { StarRating } from "./star-rating"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { Play } from "lucide-react" 

interface MusicCardProps {
  id: number
  title: string
  artist: string
  album?: string
  year?: number
  coverImage: string
  rating?: number      // Média geral
  userRating?: number  // Nota do usuário logado
  genre?: string
  duration?: string
  onClick?: () => void
}

export function MusicCard({
  id,
  title,
  artist,
  album,
  year,
  coverImage,
  rating = 0,
  userRating, 
  genre,
  duration,
}: MusicCardProps) {
  
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/musicas/${id}`);
  }

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:bg-zinc-900/80 cursor-pointer border-zinc-800 bg-zinc-900/40" 
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Área da Imagem */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={coverImage}
            alt={`${title} - ${artist}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          </div>

          {/* Badges flutuantes */}
          {genre && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 text-[10px] bg-black/60 backdrop-blur-sm text-white border-none shadow-sm"
            >
              {genre}
            </Badge>
          )}

          {duration && (
            <div className="absolute top-2 right-2 text-[10px] font-mono bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded shadow-sm">
              {duration}
            </div>
          )}
        </div>

        {/* Informações da Música */}
        <div className="p-4 space-y-2">
          <div>
            <h3 className="font-bold truncate text-zinc-100 group-hover:text-purple-400 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
            {album && (
              <p className="text-xs text-zinc-500 truncate mt-1">
                {album} {year && `• ${year}`}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800/50 mt-2">
             {/* LÓGICA: 
                Se tiver userRating (nota do usuário), mostra ela.
                Se não, mostra 0.
             */}
             {userRating !== undefined && userRating > 0 ? (
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                     Sua avaliação
                   </span>
                   <div className="flex items-center gap-2">
                      <StarRating rating={userRating} size="sm" />
                      <span className="text-sm font-bold text-purple-400">{userRating.toFixed(1)}</span>
                   </div>
                </div>
             ) : (
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                     Sua avaliação
                   </span>
                   <div className="flex items-center gap-2">
                      <StarRating rating={0} size="sm" />
                      <span className="text-sm font-bold text-purple-400">{0}</span>
                   </div>
                </div>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}