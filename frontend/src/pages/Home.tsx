import { TrendingUp, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/hero-section";
import { FeaturedSection } from "../components/featured-section";

// --- DADOS MOCKADOS (Movidos do App.tsx) ---
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

const recentlyPlayed = [
  {
    id: "8",
    title: "Bad Guy",
    artist: "Billie Eilish",
    album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
    year: 2019,
    coverImage:
      "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.3,
    userRating: 5,
    genre: "Alternative",
    duration: "3:14",
    isLiked: true,
  },
  {
    id: "9",
    title: "Someone Like You",
    artist: "Adele",
    album: "21",
    year: 2011,
    coverImage:
      "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.5,
    userRating: 4,
    genre: "Soul",
    duration: "4:45",
  },
];

const favoriteMusics = [
  {
    id: "12",
    title: "Paranoid Android",
    artist: "Radiohead",
    album: "OK Computer",
    year: 1997,
    coverImage:
      "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.7,
    userRating: 5,
    genre: "Alternative",
    duration: "6:23",
    isLiked: true,
  },
  {
    id: "13",
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    year: 1991,
    coverImage:
      "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.5,
    userRating: 5,
    genre: "Grunge",
    duration: "5:01",
    isLiked: true,
  },
];

export function Home() {
  const navigate = useNavigate();

  // Função para navegar para a página de detalhes usando a URL
  const handleMusicClick = (musicId: string) => {
    navigate(`/musicas/${musicId}`);
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section provavelmente tem botão de ouvir agora ou ver detalhes */}
      <HeroSection featuredMusic={featuredMusic} />

      <FeaturedSection
        title="Em Alta"
        subtitle="As músicas mais populares do momento"
        icon={<TrendingUp className="h-6 w-6 text-orange-500" />}
        musics={trendingMusics}
        showMore
        onMusicClick={handleMusicClick}
      />

      <FeaturedSection
        title="Tocadas Recentemente"
        subtitle="Continue de onde parou"
        icon={<Clock className="h-6 w-6 text-blue-500" />}
        musics={recentlyPlayed}
        showMore
        onMusicClick={handleMusicClick}
      />

      <FeaturedSection
        title="Suas Favoritas"
        subtitle="Músicas que você mais ama"
        icon={<Heart className="h-6 w-6 text-red-500" />}
        musics={favoriteMusics}
        showMore
        onMusicClick={handleMusicClick}
      />
    </main>
  );
}