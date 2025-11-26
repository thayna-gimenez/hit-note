import { Link, useLocation, useNavigate } from "react-router-dom" // Importações do Router
import { Search, User, Music, List, Home, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "../contexts/AuthContext" // Importação do Auth

export function Header() {
  const location = useLocation(); // Para saber qual página está ativa
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Dados do usuário

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Helper para verificar se o link está ativo
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo - Agora usa Link */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Hit.Note</span>
          </Link>

          {/* Navigation - Agora usa Links do Router */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Início</span>
              </Button>
            </Link>

            {/* <Link to="/musicas">
              <Button
                variant={isActive('/musicas') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Music className="h-4 w-4" />
                <span>Músicas</span>
              </Button>
            </Link> */}

            <Link to="/adicionar">
              <Button variant="ghost" size="sm">
                <Music className="h-4 w-4 mr-2" /> Buscar
              </Button>
            </Link>

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
                placeholder="Buscar músicas..."
                className="pl-10 w-64"
              />
            </div>

            <ThemeToggle />

            {/* --- ÁREA DE LOGIN / PERFIL --- */}
            {user ? (
              // SE ESTIVER LOGADO:
              <div className="flex items-center gap-2">
                <Link to="/perfil">
                  <Button
                    variant={isActive('/perfil') ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.nome.split(' ')[0]}</span> {/* Mostra o primeiro nome */}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sair"
                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // SE NÃO ESTIVER LOGADO (VISITANTE):
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  )
}