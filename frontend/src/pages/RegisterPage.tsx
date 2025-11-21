import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chama a rota POST /usuarios
      await registerUser(nome, email, senha);
      
      // Se der certo, manda pro login
      alert('Conta criada com sucesso!');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center text-purple-500 mb-2">Hit.Note</h1>
        <p className="text-zinc-400 text-center mb-6 text-sm">Junte-se à comunidade musical</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500 transition"
              placeholder="Seu nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

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
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}