import { useEffect, useState } from "react";
import { TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/hero-section";
import { FeaturedSection } from "../components/featured-section";

// Contexto e API
import { useAuth } from "../contexts/AuthContext";
import { getMyLikes, getMusicasPage, getRating, type Musica } from "../lib/api"; 

// --- NOVOS TIPOS DE DADOS PARA COMPONENTES DA HOME ---
type HomeMusicItem = {
    id: string; 
    title: string;
    artist: string;
    album: string;
    year: number; 
    coverImage: string;
    rating: number;
    userRating?: number;
    genre: string;
    duration: string; 
    description: string; 
};

// --- DADOS MOCKADOS ---
// Mantemos a estrutura do FeaturedMusic para evitar erros se os dados não carregarem a tempo
const EMPTY_MUSIC: HomeMusicItem = {
    id: "0",
    title: "Carregando Música...",
    artist: "Hit.Note",
    album: "Ouvindo",
    year: 2024,
    coverImage: "https://placehold.co/1080x1080/4c348d/white?text=HIT.NOTE",
    rating: 0,
    genre: "Gênero",
    duration: "0:00",
    description: "Os detalhes da música estão sendo carregados do backend.",
};


export function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [featuredMusic, setFeaturedMusic] = useState<HomeMusicItem>(EMPTY_MUSIC);
    const [trendingMusics, setTrendingMusics] = useState<HomeMusicItem[]>([]);

    const [favorites, setFavorites] = useState<HomeMusicItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper para mapear Musica do backend para HomeMusicItem do frontend
    const mapMusicToHomeItem = (music: Musica): HomeMusicItem => ({
        id: String(music.id), 
        title: music.nome,
        artist: music.artista,
        album: music.album,
        year: music.data_lancamento ? new Date(music.data_lancamento).getFullYear() : 2000,
        coverImage: music.url_imagem || "https://placehold.co/1080x1080/4c348d/white?text=MÚSICA",
        rating: 0, 
        userRating: music.user_rating,
        genre: 'Rock/Pop', 
        duration: "—", 
        description: `Avalie e descubra mais sobre a faixa "${music.nome}" de ${music.artista} no Hit.Note.`, 
    });

    useEffect(() => {
        async function loadHomeData() {
            setLoading(true);
            try {
                const musicsPage = await getMusicasPage({ page: 1, page_size: 20 });
                const allMusics = musicsPage.items.map(mapMusicToHomeItem);
                
                if (allMusics.length === 0) {
                     setFeaturedMusic(EMPTY_MUSIC);
                     setTrendingMusics([]);
                     return;
                }

                const featured = allMusics[0];
                const trending = allMusics.slice(1);
                
                const featuredRating = await getRating(featured.id);
                featured.rating = featuredRating.media || 0;
                
                const trendingWithRatings = await Promise.all(
                    trending.map(async (music) => {
                        const ratingData = await getRating(music.id);
                        return { ...music, rating: ratingData.media || 0 };
                    })
                );

                setFeaturedMusic(featured);
                setTrendingMusics(trendingWithRatings);
                
                if (user) {
                    const favoritesData = await getMyLikes();
                    const mappedFavorites = await Promise.all(favoritesData.map(async (music) => {
                        const baseItem = mapMusicToHomeItem(music);
                        const ratingData = await getRating(music.id);
                        return { ...baseItem, rating: ratingData.media || 0 };
                    }));
                    setFavorites(mappedFavorites);
                } else {
                    setFavorites([]);
                }

            } catch (err) {
                console.error("Erro ao carregar dados da Home:", err);
                setFeaturedMusic(EMPTY_MUSIC);
            } finally {
                setLoading(false);
            }
        }
        
        loadHomeData();

    }, [user]); 

    const handleMusicClick = (musicId: string | number) => {
        navigate(`/musicas/${musicId}`);
    };
    
    if (loading && featuredMusic.id === '0') {
    }

    return (
        <main className="container mx-auto px-4 py-8 space-y-12 pb-24">
            
            {/* Hero Section */}
            <HeroSection featuredMusic={featuredMusic} onMusicClick={handleMusicClick} />

            {/* Em Alta */}
            {(loading || trendingMusics.length > 0) && (
                <FeaturedSection
                    title="Em Alta"
                    subtitle={loading ? "Carregando as músicas populares..." : "As músicas mais populares do momento"}
                    icon={<TrendingUp className="h-6 w-6 text-orange-500" />}
                    musics={trendingMusics}
                    showMore
                    onMusicClick={handleMusicClick}
                />
            )}
            
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