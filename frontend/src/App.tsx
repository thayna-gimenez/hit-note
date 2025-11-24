import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Music } from "lucide-react";

// Providers
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";

// Components Fixos
import { Header } from "./components/header";

// Páginas
import { Home } from "./pages/Home";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import AllMusics from "./components/AllMusics";
import MusicDetail from "./components/music-detail";
import { UserProfile } from "./components/user-profile";
import { AddMusicPage } from "./pages/AddMusicPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
            {/* O Header fica fora das Routes para aparecer em todas as telas */}
            <Header />

            <div className="flex-grow">
              <Routes>
                {/* Rota principal (Home) */}
                <Route path="/" element={<Home />} />

                {/* Rotas de Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Rotas de Funcionalidades */}
                <Route path="/musicas" element={<AllMusics />} />
                {/* :id indica que é um parâmetro dinâmico */}
                <Route path="/musicas/:id" element={<MusicDetail />} />
                <Route path="/perfil" element={<UserProfile />} />
                {/* Rota para OUTROS perfis (com ID) */}
                <Route path="/usuarios/:id" element={<UserProfile />} />
                {/* Rota de busca genius e adição de música */}
                <Route path="/adicionar" element={<AddMusicPage />} />
              </Routes>
            </div>

            {/* Footer */}
            <footer className="border-t bg-card/50 mt-16">
              <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Music className="h-5 w-5" />
                  <span>Hit.Note - Avalie, descubra e compartilhe música</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;