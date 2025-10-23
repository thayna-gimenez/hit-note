import { useState, useMemo } from "react"
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { MusicCard } from "./music-card"

interface Music {
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
}

interface AllMusicsProps {
  onMusicClick: (musicId: string) => void
}

// Expanded mock data with more musics
const allMusicsData: Music[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    year: 1975,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    userRating: 5,
    genre: "Rock",
    duration: "5:55",
    isLiked: true
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    year: 2020,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    userRating: 5,
    genre: "Pop",
    duration: "3:20",
    isLiked: true
  },
  {
    id: "3",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    year: 2017,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.4,
    userRating: 4,
    genre: "Pop",
    duration: "3:53"
  },
  {
    id: "4",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    year: 1976,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    genre: "Rock",
    duration: "6:30"
  },
  {
    id: "5",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    year: 1982,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    userRating: 5,
    genre: "Pop",
    duration: "4:54",
    isLiked: true
  },
  {
    id: "6",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    year: 1971,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    genre: "Rock",
    duration: "8:02"
  },
  {
    id: "7",
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    year: 1971,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    userRating: 4,
    genre: "Rock",
    duration: "3:07"
  },
  {
    id: "8",
    title: "Bad Guy",
    artist: "Billie Eilish",
    album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
    year: 2019,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.3,
    userRating: 5,
    genre: "Alternative",
    duration: "3:14",
    isLiked: true
  },
  {
    id: "9",
    title: "Someone Like You",
    artist: "Adele",
    album: "21",
    year: 2011,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5,
    userRating: 4,
    genre: "Soul",
    duration: "4:45"
  },
  {
    id: "10",
    title: "Thunderstruck",
    artist: "AC/DC",
    album: "The Razors Edge",
    year: 1990,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.4,
    genre: "Hard Rock",
    duration: "4:52"
  },
  {
    id: "11",
    title: "Rolling in the Deep",
    artist: "Adele",
    album: "21",
    year: 2010,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    userRating: 5,
    genre: "Soul",
    duration: "3:48",
    isLiked: true
  },
  {
    id: "12",
    title: "Paranoid Android",
    artist: "Radiohead",
    album: "OK Computer",
    year: 1997,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    userRating: 5,
    genre: "Alternative",
    duration: "6:23",
    isLiked: true
  },
  {
    id: "13",
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    year: 1991,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5,
    userRating: 5,
    genre: "Grunge",
    duration: "5:01",
    isLiked: true
  },
  {
    id: "14",
    title: "Purple Haze",
    artist: "Jimi Hendrix",
    album: "Are You Experienced",
    year: 1967,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    userRating: 5,
    genre: "Psychedelic Rock",
    duration: "2:50",
    isLiked: true
  },
  {
    id: "15",
    title: "Good Vibrations",
    artist: "The Beach Boys",
    album: "Smiley Smile",
    year: 1966,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.4,
    userRating: 4,
    genre: "Pop Rock",
    duration: "3:36",
    isLiked: true
  },
  {
    id: "16",
    title: "What's Going On",
    artist: "Marvin Gaye",
    album: "What's Going On",
    year: 1971,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    genre: "Soul",
    duration: "3:53"
  },
  {
    id: "17",
    title: "Like a Rolling Stone",
    artist: "Bob Dylan",
    album: "Highway 61 Revisited",
    year: 1965,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    userRating: 4,
    genre: "Folk Rock",
    duration: "6:13"
  },
  {
    id: "18",
    title: "Respect",
    artist: "Aretha Franklin",
    album: "I Never Loved a Man the Way I Love You",
    year: 1967,
    coverImage: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBtdXNpY3xlbnwxfHx8fDE3NTg1NTM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    userRating: 5,
    genre: "Soul",
    duration: "2:28",
    isLiked: true
  },
  {
    id: "19",
    title: "Hey Jude",
    artist: "The Beatles",
    album: "Past Masters",
    year: 1968,
    coverImage: "https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWx8ZW58MXx8fHwxNzU4NTQxMDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    userRating: 5,
    genre: "Rock",
    duration: "7:11",
    isLiked: true
  },
  {
    id: "20",
    title: "Waterloo Sunset",
    artist: "The Kinks",
    album: "Something Else by The Kinks",
    year: 1967,
    coverImage: "https://images.unsplash.com/photo-1598488035252-042a85bc8e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGhlYWRwaG9uZXMlMjBzdHVkaW98ZW58MXx8fHwxNzU4NTYwMzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.4,
    genre: "Rock",
    duration: "3:34"
  }
]

const genres = Array.from(new Set(allMusicsData.map(music => music.genre).filter(Boolean)))
const decades = Array.from(new Set(allMusicsData.map(music => {
  if (!music.year) return null
  return `${Math.floor(music.year / 10) * 10}s`
}).filter(Boolean)))

type ViewMode = 'grid' | 'list'
type SortBy = 'title' | 'artist' | 'year' | 'rating' | 'userRating'

export function AllMusics({ onMusicClick }: AllMusicsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedDecade, setSelectedDecade] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortBy>("title")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showOnlyLiked, setShowOnlyLiked] = useState(false)
  const [showOnlyRated, setShowOnlyRated] = useState(false)

  const filteredAndSortedMusics = useMemo(() => {
    let filtered = allMusicsData.filter(music => {
      const matchesSearch = 
        music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.album?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGenre = selectedGenre === "all" || music.genre === selectedGenre
      
      const matchesDecade = selectedDecade === "all" || 
        (music.year && `${Math.floor(music.year / 10) * 10}s` === selectedDecade)
      
      const matchesLiked = !showOnlyLiked || music.isLiked
      const matchesRated = !showOnlyRated || music.userRating !== undefined

      return matchesSearch && matchesGenre && matchesDecade && matchesLiked && matchesRated
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'artist':
          return a.artist.localeCompare(b.artist)
        case 'year':
          return (b.year || 0) - (a.year || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'userRating':
          return (b.userRating || 0) - (a.userRating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedGenre, selectedDecade, sortBy, showOnlyLiked, showOnlyRated])

  const activeFiltersCount = [
    selectedGenre !== "all",
    selectedDecade !== "all", 
    showOnlyLiked,
    showOnlyRated
  ].filter(Boolean).length

  const clearFilters = () => {
    setSelectedGenre("all")
    setSelectedDecade("all")
    setShowOnlyLiked(false)
    setShowOnlyRated(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Todas as Músicas</h1>
        <p className="text-muted-foreground">
          Explore nossa coleção completa de {allMusicsData.length} músicas
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ListIcon className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista ou álbum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os gêneros</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDecade} onValueChange={setSelectedDecade}>
              <SelectTrigger>
                <SelectValue placeholder="Década" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as décadas</SelectItem>
                {decades.sort().reverse().map(decade => (
                  <SelectItem key={decade} value={decade}>{decade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Título A-Z</SelectItem>
                <SelectItem value="artist">Artista A-Z</SelectItem>
                <SelectItem value="year">Ano (mais recente)</SelectItem>
                <SelectItem value="rating">Avaliação (maior)</SelectItem>
                <SelectItem value="userRating">Minha nota (maior)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={showOnlyLiked ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyLiked(!showOnlyLiked)}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-1" />
                Curtidas
              </Button>
            </div>
          </div>

          {/* Additional Filter Toggles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={showOnlyRated ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyRated(!showOnlyRated)}
              >
                Apenas avaliadas
              </Button>
              
              {activeFiltersCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedMusics.length} música{filteredAndSortedMusics.length !== 1 ? 's' : ''} encontrada{filteredAndSortedMusics.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAndSortedMusics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma música encontrada com os filtros aplicados.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
            : "space-y-2"
        }>
          {filteredAndSortedMusics.map((music) => (
            viewMode === 'grid' ? (
              <MusicCard
                key={music.id}
                {...music}
                onPlay={() => console.log(`Playing ${music.title}`)}
                onLike={() => console.log(`Liked ${music.title}`)}
                onRate={(rating) => console.log(`Rated ${music.title}: ${rating} stars`)}
                onClick={() => onMusicClick(music.id)}
              />
            ) : (
              <Card key={music.id} className="group cursor-pointer hover:shadow-md transition-shadow" onClick={() => onMusicClick(music.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded overflow-hidden">
                      <img
                        src={music.coverImage}
                        alt={music.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{music.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {music.artist} • {music.album} {music.year && `(${music.year})`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {music.genre && (
                        <Badge variant="secondary" className="text-xs">
                          {music.genre}
                        </Badge>
                      )}
                      {music.rating && (
                        <div className="text-sm text-muted-foreground">
                          ⭐ {music.rating}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {music.duration}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  )
}