import sqlite3 as lite
from bd import get_connection

# REMOVIDO: conexao = lite.connect('bd_hitnote.db')

def criarTabelaMusica():
    with get_connection() as conexao:
        cur = conexao.cursor()
        # cur.execute("DROP TABLE Musica")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Musica(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                artista TEXT,
                album TEXT,
                duracao TEXT
            )
        """)

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
