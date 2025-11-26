import { Play, Heart, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { StarRating } from "./star-rating"
import { Badge } from "./ui/badge"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface HeroSectionProps {
  featuredMusic: {
    id: string
    title: string
    artist: string
    album: string
    year: number
    coverImage: string
    rating: number
    genre: string
    duration: string
    description: string
  }
  onMusicClick: (musicId: string | number) => void;
}

export function HeroSection({ featuredMusic, onMusicClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={featuredMusic.coverImage}
          alt={featuredMusic.title}
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="space-y-6 text-white">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                Destaque da Semana
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {featuredMusic.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/80">
                por {featuredMusic.artist}
              </p>
              <p className="text-lg text-white/70">
                {featuredMusic.album} • {featuredMusic.year}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <StarRating rating={featuredMusic.rating} size="lg" />
              <span className="text-lg font-medium">{featuredMusic.rating}/5</span>
              {/* <Badge variant="outline" className="border-white/30 text-white">
                {featuredMusic.genre}
              </Badge> */}
            </div>

            {/* Description */}
            <p className="text-white/80 text-lg leading-relaxed max-w-lg">
              {featuredMusic.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                <Heart className="h-5 w-5 mr-2" />
                Favoritar
              </Button>
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar à Lista
              </Button>
            </div>
          </div>

          {/* Album Cover */}
          <div className="flex justify-center md:justify-end">
            <div 
              className="relative cursor-pointer group" 
              onClick={() => onMusicClick(featuredMusic.id)} 
            >
              <div className="w-80 h-80 rounded-lg overflow-hidden shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <ImageWithFallback
                  src={featuredMusic.coverImage}
                  alt={`${featuredMusic.title} cover`}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <span className="text-sm font-medium text-black">{featuredMusic.duration}</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}