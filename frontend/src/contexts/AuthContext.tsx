import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Usuario } from '../lib/api';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

// Cria o contexto com um valor inicial vazio (será preenchido pelo Provider)
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  // Ao carregar a página (F5), verifica se já tem login salvo no LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('hitnote_user');
    const storedToken = localStorage.getItem('hitnote_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Se o JSON estiver corrompido, limpa tudo
        console.error("Erro ao recuperar sessão", e);
        logout();
      }
    }
  }, []);

  // Função chamada após o sucesso na tela de Login
  const login = (token: string, usuario: Usuario) => {
    localStorage.setItem('hitnote_token', token);
    localStorage.setItem('hitnote_user', JSON.stringify(usuario));
    setUser(usuario);
  };

  // Função para deslogar
  const logout = () => {
    localStorage.removeItem('hitnote_token');
    localStorage.removeItem('hitnote_user');
    setUser(null);
    // Opcional: Redirecionar para login
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso nos componentes
// Ex: const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);