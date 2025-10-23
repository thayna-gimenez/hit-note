import { Search, User, Music, List, Home } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ThemeToggle } from "./theme-toggle"

interface HeaderProps {
  currentView: string
  onNavigate: (view: string) => void
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Hit.Note</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button 
              variant={currentView === 'home' ? 'default' : 'ghost'} 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => onNavigate('home')}
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </Button>
            <Button 
              variant={currentView === 'allMusics' ? 'default' : 'ghost'} 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => onNavigate('allMusics')}
            >
              <Music className="h-4 w-4" />
              <span>Músicas</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Listas</span>
            </Button>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar músicas, artistas..."
                className="pl-10 w-64"
              />
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Profile */}
            <Button 
              variant={currentView === 'profile' ? 'default' : 'ghost'} 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => onNavigate('profile')}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}