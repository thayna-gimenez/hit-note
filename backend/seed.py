"""
Seed do banco para o HitNote.

Uso:
  (Windows / CMD ou PowerShell)
  > cd backend
  > .\.venv\Scripts\activate
  > python seed.py

Depois, suba a API:
  > uvicorn main:app --reload --port 8000

Observações:
- Este script apaga dados existentes se RESET=True.
- As tabelas são criadas automaticamente (se não existirem).
"""

from random import randint, uniform, choice, seed as rnd_seed
from typing import List, Tuple

from bd import get_connection
from crud.crud_musica import criarTabelaMusica
from crud.crud_review import criarTabelaReview

# --------------------- Config ---------------------
RESET = True          # se True, apaga dados antes de inserir
N_REVIEWS_MIN = 1     # mínimo de reviews por música
N_REVIEWS_MAX = 6     # máximo de reviews por música

# Semente fixa pra reprodutibilidade (pode comentar se quiser aleatório)
rnd_seed(42)

# --------------------- Dados ----------------------
MUSICAS: List[Tuple[str, str, str, str]] = [
    ("Bohemian Rhapsody", "Queen", "A Night at the Opera", "05:55"),
    ("Blinding Lights", "The Weeknd", "After Hours", "03:20"),
    ("Shape of You", "Ed Sheeran", "÷ (Divide)", "03:53"),
    ("Hotel California", "Eagles", "Hotel California", "06:30"),
    ("Billie Jean", "Michael Jackson", "Thriller", "04:54"),
    ("Stairway to Heaven", "Led Zeppelin", "Led Zeppelin IV", "08:02"),
    ("Imagine", "John Lennon", "Imagine", "03:07"),
    ("Paranoid Android", "Radiohead", "OK Computer", "06:23"),
    ("Smells Like Teen Spirit", "Nirvana", "Nevermind", "05:01"),
    ("Good Vibrations", "The Beach Boys", "Smiley Smile", "03:36"),
]

COMENTARIOS = [
    "Clássico absoluto! Volto sempre a ouvir.",
    "Produção impecável e letra marcante.",
    "Melodia grudenta, não sai da cabeça!",
    "Uma obra-prima — arranjo e dinâmica fantásticos.",
    "Refrão forte e ótima performance vocal.",
    "Bom, mas prefiro outras do álbum.",
    "Letra potente e instrumental muito bem feito.",
    "A energia dessa faixa é sensacional!",
    "Tenho ouvido em loop nos últimos dias.",
    "A mixagem é um show à parte.",
]


def reset_db() -> None:
    """Apaga dados das tabelas Musica e Review (se existirem)."""
    with get_connection() as con:
        cur = con.cursor()
        # apaga a tabela de reviews primeiro por dependência lógica (usa nome de música)
        cur.execute("DROP TABLE IF EXISTS Review")
        cur.execute("DROP TABLE IF EXISTS Musica")
        con.commit()
    print("→ Banco resetado (tabelas Musica e Review removidas).")


def bootstrap_tables() -> None:
    """Garante que as tabelas existam."""
    criarTabelaMusica()
    criarTabelaReview()
    print("→ Tabelas garantidas/atualizadas.")


def seed_musicas() -> int:
    """Insere músicas base e retorna quantidade inserida."""
    with get_connection() as con:
        cur = con.cursor()
        cur.executemany(
            "INSERT INTO Musica(nome, artista, album, duracao) VALUES (?,?,?,?)",
            MUSICAS,
        )
        con.commit()
    count = len(MUSICAS)
    print(f"→ Inseridas {count} músicas.")
    return count


def seed_reviews() -> int:
    """
    Cria reviews aleatórios para cada música.
    Mantém o design atual: Review.musica = NOME (string).
    Retorna total de reviews inseridos.
    """
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT id, nome FROM Musica")
        rows = cur.fetchall()  # [(id, nome), ...]

        total = 0
        for _id, nome in rows:
            n = randint(N_REVIEWS_MIN, N_REVIEWS_MAX)
            batch = []
            for _ in range(n):
                nota = round(min(5.0, max(0.0, uniform(3.0, 5.0))), 1)
                comentario = choice(COMENTARIOS)
                batch.append((nome, nota, comentario))

            if batch:
                cur.executemany(
                    "INSERT INTO Review(musica, nota, comentario) VALUES (?,?,?)",
                    batch,
                )
                total += len(batch)

        con.commit()

    print(f"→ Inseridos {total} reviews.")
    return total


def show_summary() -> None:
    """Mostra um resumo (contagens e média) só pra conferência rápida."""
    with get_connection() as con:
        cur = con.cursor()

        cur.execute("SELECT COUNT(*) FROM Musica")
        mcount = cur.fetchone()[0] or 0

        cur.execute("SELECT COUNT(*) FROM Review")
        rcount = cur.fetchone()[0] or 0

        cur.execute("SELECT AVG(nota) FROM Review")
        avg = cur.fetchone()[0]
        avg_txt = f"{avg:.2f}" if avg is not None else "—"

    print("--------------------------------------------------")
    print(f"Resumo: {mcount} músicas, {rcount} reviews, média geral = {avg_txt}")
    print("--------------------------------------------------")


def main() -> None:
    if RESET:
        reset_db()

    bootstrap_tables()
    seed_musicas()
    seed_reviews()
    show_summary()


if __name__ == "__main__":
    main()
