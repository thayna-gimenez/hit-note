import sqlite3 as lite
from bd import get_connection

# ------------------ TABELA ------------------

def criarTabelaMusica():
    with get_connection() as conexao:
        cur = conexao.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Musica(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                artista TEXT,
                album TEXT,
                duracao TEXT
            )
        """)

# ------------------ CRUD BÁSICO ------------------

def inserirDados(dados):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Musica(nome, artista, album, duracao) VALUES(?,?,?,?)"
        cur.execute(query, dados)

def atualizarDados(novos_dados):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "UPDATE Musica SET nome=?, artista=?, album=?, duracao=? WHERE id=?"
        cur.execute(query, novos_dados)

def deletarDados(id):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "DELETE FROM Musica WHERE id=?"
        cur.execute(query, id)

def visualizarDados():
    ver_dados = []
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Musica"
        cur.execute(query)
        linhas = cur.fetchall()
        for linha in linhas:
            ver_dados.append(linha)
    return ver_dados

def verLinha(id):
    ver_linha = []
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Musica WHERE id=?"
        cur.execute(query, id)
        linhas = cur.fetchall()
        for linha in linhas:
            ver_linha.append(linha)
    return ver_linha

# ------------------ BUSCA + PAGINAÇÃO ------------------

_ALLOWED_ORDER = {
    "id_asc": "id ASC",
    "id_desc": "id DESC",
    "nome_asc": "nome COLLATE NOCASE ASC",
    "nome_desc": "nome COLLATE NOCASE DESC",
}

def _where_and_params(q: str | None):
    if q and q.strip():
        like = f"%{q.strip()}%"
        where = "WHERE (nome LIKE ? OR artista LIKE ? OR album LIKE ?)"
        params = (like, like, like)
    else:
        where = ""
        params = tuple()
    return where, params

def contar_busca(q: str | None) -> int:
    where, params = _where_and_params(q)
    with get_connection() as conexao:
        cur = conexao.cursor()
        cur.execute(f"SELECT COUNT(*) FROM Musica {where}", params)
        (total,) = cur.fetchone()
    return int(total or 0)

def listar_busca(q: str | None, order: str, limit: int, offset: int):
    order_sql = _ALLOWED_ORDER.get(order, _ALLOWED_ORDER["id_desc"])
    where, params = _where_and_params(q)
    with get_connection() as conexao:
        cur = conexao.cursor()
        cur.execute(
            f"SELECT id, nome, artista, album, duracao FROM Musica {where} "
            f"ORDER BY {order_sql} LIMIT ? OFFSET ?",
            (*params, limit, offset),
        )
        return cur.fetchall()
