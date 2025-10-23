import sqlite3 as lite
from bd import get_connection

# Criando tabela
def criarTabelaUsuario():
    with get_connection() as conexao:
        cur = conexao.cursor()
        # cur.execute("DROP TABLE Usuario")
        cur.execute("CREATE TABLE Usuario(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, username TEXT, senha TEXT, email TEXT)")


# Inserindo dados 
def inserirDados(dados):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Usuario(nome, username, senha, email) VALUES(?,?,?,?)"
        cur.execute(query, dados)

# Atualizando dados
def atualizarDados(novos_dados):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "UPDATE Usuario SET nome=?, username=?, senha=?, email=? WHERE id=?"
        cur.execute(query, novos_dados)

# Deletando dados
def deletarDados(id):
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "DELETE FROM Usuario WHERE id=?"
        cur.execute(query, id)

# Vendo dados
def visualizarDados():
    ver_dados = []
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Usuario"
        cur.execute(query)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_dados.append(linha)
    
    return ver_dados

def verLinha(id):
    ver_linha = []
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Usuario WHERE id=?"
        cur.execute(query, id)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_linha.append(linha)
        
    return ver_linha