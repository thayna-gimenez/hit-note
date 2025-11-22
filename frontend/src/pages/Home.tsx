import { useEffect, useState } from "react";
import { TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/hero-section";
import { FeaturedSection } from "../components/featured-section";

// Contexto e API
import { useAuth } from "../contexts/AuthContext";
import { getMyLikes } from "../lib/api";

// --- DADOS MOCKADOS ---
const featuredMusic = {
  id: "1",
  title: "Bohemian Rhapsody",
  artist: "Queen",
  album: "A Night at the Opera",
  year: 1975,
  coverImage:
    "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  rating: 4.8,
  genre: "Rock",
  duration: "5:55",
  description:
    "Uma obra-prima do rock progressivo que combina ópera, hard rock e balada em uma experiência musical única e inesquecível.",
};

const trendingMusics = [
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    year: 2020,
    coverImage:
      "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.6,
    userRating: 5,
    genre: "Pop",
    duration: "3:20",
    isLiked: true,
  },
  {
    id: "3",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    year: 2017,
    coverImage:
      "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.4,
    userRating: 4,
    genre: "Pop",
    duration: "3:53",
  },
  {
    id: "4",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    year: 1976,
    coverImage:
      "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.9,
    genre: "Rock",
    duration: "6:30",
  },
];

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // Só busca se tiver usuário logado
    if (user) {
      getMyLikes()
        .then((data) => {
          const mappedFavorites = data.map((music) => ({
            id: String(music.id), 
            title: music.nome,
            artist: music.artista,
            album: music.album,
            coverImage: music.url_imagem || "",
            rating: 0, 
            userRating: music.user_rating, 
          }));
          
          setFavorites(mappedFavorites);
        })
        .catch((err) => console.error("Erro ao carregar favoritas na Home:", err));
    } else {
      setFavorites([]); 
    }
  }, [user]);

  const handleMusicClick = (musicId: string | number) => {
    navigate(`/musicas/${musicId}`);
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-12 pb-24">
      {/* Hero Section */}
      <HeroSection featuredMusic={featuredMusic} />

      <FeaturedSection
        title="Em Alta"
        subtitle="As músicas mais populares do momento"
        icon={<TrendingUp className="h-6 w-6 text-orange-500" />}
        musics={trendingMusics}
        showMore
        onMusicClick={handleMusicClick}
      />

      {/* Renderiza Favoritas APENAS se estiver logado e tiver músicas */}
      {user && favorites.length > 0 && (
        <FeaturedSection
          title={`Favoritas de ${user.nome}`}
          subtitle="Músicas que você curtiu"
          icon={<Heart className="h-6 w-6 text-red-500" />}
          musics={favorites}
          showMore={false} 
          onMusicClick={handleMusicClick}
        />
      )}
    </main>
  );
}