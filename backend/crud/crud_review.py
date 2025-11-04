import sqlite3 as lite
from bd import get_connection

def criarTabelaReview():
    with get_connection() as conexao:
        cur = conexao.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Review(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                musica TEXT,
                nota FLOAT,
                comentario TEXT
            )
        """)

def inserirDados(dados):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Review(musica, nota, comentario) VALUES(?,?,?)"
        cur.execute(query, dados)

def atualizarDados(novos_dados):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "UPDATE Review SET musica=?, nota=?, comentario=? WHERE id=?"
        cur.execute(query, novos_dados)

def deletarDados(id):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "DELETE FROM Review WHERE id=?"
        cur.execute(query, id)

def visualizarDados():
    ver_dados = []
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Review"
        cur.execute(query)
        linhas = cur.fetchall()
        for linha in linhas:
            ver_dados.append(linha)
    return ver_dados

def verLinha(id):
    ver_linha = []
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Review WHERE id=?"
        cur.execute(query, id)
        linhas = cur.fetchall()
        for linha in linhas:
            ver_linha.append(linha)
    return ver_linha
