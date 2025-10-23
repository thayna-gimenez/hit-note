import { Heart, Plus, Play } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { StarRating } from "./star-rating"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface MusicCardProps {
  id: string
  title: string
  artist: string
  album?: string
  year?: number
  coverImage: string
  rating?: number
  userRating?: number
  genre?: string
  duration?: string
  isLiked?: boolean
  onPlay?: () => void
  onLike?: () => void
  onRate?: (rating: number) => void
  onClick?: () => void
}

export function MusicCard({
  id,
  title,
  artist,
  album,
  year,
  coverImage,
  rating,
  userRating,
  genre,
  duration,
  isLiked = false,
  onPlay,
  onLike,
  onRate,
  onClick
}: MusicCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={coverImage}
            alt={`${title} - ${artist}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={onPlay} className="bg-white text-black hover:bg-white/90">
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onLike}
                className={`border-white text-white hover:bg-white hover:text-black ${
                  isLiked ? 'bg-white text-black' : 'bg-transparent'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Genre Badge */}
          {genre && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 text-xs bg-black/70 text-white border-none"
            >
              {genre}
            </Badge>
          )}

          {/* Duration */}
          {duration && (
            <div className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
              {duration}
            </div>
          )}
        </div>

        {/* Music Info */}
        <div className="p-4 space-y-2">
          <div>
            <h3 className="font-medium truncate">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
            {album && (
              <p className="text-xs text-muted-foreground truncate">
                {album} {year && `(${year})`}
              </p>
            )}
          </div>

          {/* Ratings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {rating && (
                <div className="flex items-center space-x-2">
                  <StarRating rating={rating} size="sm" />
                  <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
                </div>
              )}
              
              {userRating !== undefined && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Sua:</span>
                  <StarRating 
                    rating={userRating} 
                    size="sm" 
                    interactive 
                    onRatingChange={onRate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}