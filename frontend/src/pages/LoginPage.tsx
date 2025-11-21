import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Pegamos a função de login do nosso Contexto
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Chama a API (backend)
      const data = await loginUser(email, senha);
      
      // 2. Salva no Contexto (localStorage + estado global)
      login(data.access_token, data.usuario);
      
      // 3. Redireciona para a Home
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center text-purple-500 mb-6">Hit.Note</h1>
        
        <h2 className="text-xl font-semibold text-center mb-6">Acesse sua conta</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500 transition"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500 transition"
              placeholder="******"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Ainda não tem conta?{' '}
          <Link to="/register" className="text-purple-400 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}