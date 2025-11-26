import { TrendingUp, Clock, Heart } from "lucide-react"
import { MusicCard } from "./music-card"
import { Button } from "./ui/button"
import { Link } from "react-router-dom" // Importações do Router
import React, { useRef } from 'react';

interface FeaturedSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  musics: Array<{
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
  }>
  showMore?: boolean
  onMusicClick?: (musicId: string) => void
}

export function FeaturedSection({
  title,
  subtitle,
  icon,
  musics,
  showMore = false,
  onMusicClick
}: FeaturedSectionProps) {

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Função para rolar o carrossel
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Quantidade de pixels a rolar
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {icon}
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {showMore && (
          <Link to="/musicas">
            <Button variant="outline" size="sm">
              Ver mais
            </Button>
          </Link>
        )}
      </div>

      {/* Music Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {musics.map((music) => (
          <MusicCard
            key={music.id}
            {...music}
            onClick={() => onMusicClick?.(music.id)}
          />
        ))}
      </div>
    </section>
  )
}