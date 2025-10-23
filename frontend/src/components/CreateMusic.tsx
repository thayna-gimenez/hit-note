import { useState } from "react";
import { createMusica, type MusicaIn } from "../lib/api";

export function CreateMusic({ onCreated }: { onCreated?: () => void }) {
  const [form, setForm] = useState<MusicaIn>({ nome: "", artista: "", album: "", duracao: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createMusica(form);
      setForm({ nome: "", artista: "", album: "", duracao: "" });
      onCreated?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const base =
    "bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6 grid gap-3 max-w-xl bg-card/50 border border-border rounded-2xl">
      <h3 className="text-lg font-semibold">Adicionar música</h3>
      <input className={base} placeholder="Nome" value={form.nome} onChange={(e) => setForm(f => ({...f, nome: e.target.value}))} required />
      <input className={base} placeholder="Artista" value={form.artista} onChange={(e) => setForm(f => ({...f, artista: e.target.value}))} required />
      <input className={base} placeholder="Álbum" value={form.album} onChange={(e) => setForm(f => ({...f, album: e.target.value}))} required />
      <input className={base} placeholder="Duração (mm:ss)" value={form.duracao} onChange={(e) => setForm(f => ({...f, duracao: e.target.value}))} pattern="^\d+:\d{2}$" title="Formato mm:ss" required />
      {error && <div className="text-red-500 text-sm">Erro: {error}</div>}
      <button type="submit" disabled={saving} className="self-start bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60">
        {saving ? "Salvando…" : "Adicionar"}
      </button>
    </form>
  );
}
