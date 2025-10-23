import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Clock, Heart, Music } from "lucide-react";

import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { FeaturedSection } from "./components/featured-section";
import { UserProfile } from "./components/user-profile";
import { MusicDetail } from "./components/music-detail";

// >>> use seus componentes que falam com o backend
import AllMusics from "./components/AllMusics";
import { CreateMusic } from "./components/CreateMusic";

import { getMusicas, type Musica } from "./lib/api";

// shape que as seções do Figma esperam
type FigmaMusic = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  year?: number;
  coverImage?: string;
  rating?: number;
  userRating?: number;
  genre?: string;
  isLiked?: boolean;
  description?: string;
};

// adapta do backend (Musica) para o formato usado nas seções do Figma
function toFigmaMusic(m: Musica): FigmaMusic {
  return {
    id: String(m.id),
    title: m.nome,
    artist: m.artista,
    album: m.album,
    duration: m.duracao,
  };
}

function AppContent() {
  const [currentView, setCurrentView] = useState<"home" | "profile" | "music" | "allMusics">("home");
  const [selectedMusicId, setSelectedMusicId] = useState<string>("");

  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refresh, setRefresh] = useState(0); // para recarregar após criar

  // carrega do backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    getMusicas()
      .then(setMusicas)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [refresh]);

  const handleNavigate = (view: string) => {
    setCurrentView(view as "home" | "profile" | "music" | "allMusics");
  };

  const handleMusicClick = (musicId: string) => {
    setSelectedMusicId(musicId);
    setCurrentView("music");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedMusicId("");
  };

  // converte a lista do backend para o formato das seções
  const figmaList = useMemo(() => musicas.map(toFigmaMusic), [musicas]);

  // define a música em destaque (pode ser a primeira)
  const featuredMusic = useMemo(() => {
    const first = figmaList[0];
    if (!first) return undefined;
    return {
      ...first,
      // valores de apresentação até termos colunas reais (capa/gênero/nota)
      coverImage:
        "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?q=80&w=1080&auto=format&fit=crop",
      rating: 4.7,
      genre: "Rock",
      description:
        "Descubra, avalie e compartilhe suas músicas favoritas com a comunidade.",
    } as FigmaMusic;
  }, [figmaList]);

  // por enquanto, dividimos a lista em blocos para preencher as seções
  const trendingMusics = figmaList.slice(0, 6);
  const recentlyPlayed = figmaList.slice(6, 10);
  const favoriteMusics = figmaList.slice(10, 14);

  const renderContent = () => {
    if (loading) {
      return <main className="container mx-auto px-4 py-8">Carregando…</main>;
    }
    if (error) {
      return (
        <main className="container mx-auto px-4 py-8 text-red-500">
          Erro: {error}
        </main>
      );
    }

    switch (currentView) {
      case "profile":
        return <UserProfile onMusicClick={handleMusicClick} />;

      case "music":
        return <MusicDetail musicId={selectedMusicId} onBack={handleBackToHome} />;

      case "allMusics":
        // seu componente já puxa do backend
        return <AllMusics onMusicClick={handleMusicClick} />;

      default:
        return (
          <main className="container mx-auto px-4 py-8 space-y-12">
            {/* Hero (usa a primeira música como destaque) */}
            {featuredMusic && <HeroSection featuredMusic={featuredMusic} />}

            {/* Form de criação (salva no backend) */}
            <CreateMusic onCreated={() => setRefresh((r) => r + 1)} />

            {/* Listagem geral (busca no backend) */}
            <section>
              <AllMusics onMusicClick={handleMusicClick} />
            </section>

            {/* Seções do Figma preenchidas com a lista */}
            <FeaturedSection
              title="Em Alta"
              subtitle="As músicas mais populares do momento"
              icon={<TrendingUp className="h-6 w-6 text-orange-500" />}
              musics={trendingMusics}
              showMore={true}
              onMusicClick={handleMusicClick}
            />

            <FeaturedSection
              title="Tocadas Recentemente"
              subtitle="Continue de onde parou"
              icon={<Clock className="h-6 w-6 text-blue-500" />}
              musics={recentlyPlayed}
              showMore={true}
              onMusicClick={handleMusicClick}
            />

            <FeaturedSection
              title="Suas Favoritas"
              subtitle="Músicas que você mais ama"
              icon={<Heart className="h-6 w-6 text-red-500" />}
              musics={favoriteMusics}
              showMore={true}
              onMusicClick={handleMusicClick}
            />
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {currentView !== "music" && (
        <Header currentView={currentView} onNavigate={handleNavigate} />
      )}

      {renderContent()}

      {currentView === "home" && (
        <footer className="border-t bg-card/50 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Music className="h-5 w-5" />
              <span>Hit.Note - Avalie, descubra e compartilhe música</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AppContent />
    </ThemeProvider>
  );
}
