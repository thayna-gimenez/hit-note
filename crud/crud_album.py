import sqlite3 as lite

# Criando conexão
conexao = lite.connect('bd_hitnote.db')

# Criando tabela
def criarTabelaAlbum():
    with conexao:
        cur = conexao.cursor()
        #cur.execute("DROP TABLE Album")
        cur.execute("CREATE TABLE Album(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, notaMedia FLOAT, qtdeMusicas INT, artista TEXT, duracao TEXT, genero TEXT)")


# Inserindo dados 
def inserirDados(dados):
    with conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Album(nome, notaMedia, qtdeMusicas, artista, duracao, genero) VALUES(?,?,?,?,?,?)"
        cur.execute(query, dados)

# Atualizando dados
def atualizarDados(novos_dados):
    with conexao:
        cur = conexao.cursor()
        query = "UPDATE Album SET nome=?, notaMedia=?, qtdeMusicas=?, artista=?, duracao=?, genero=? WHERE id=?"
        cur.execute(query, novos_dados)

# Deletando dados
def deletarDados(id):
    with conexao:
        cur = conexao.cursor()
        query = "DELETE FROM Album WHERE id=?"
        cur.execute(query, id)

# Vendo dados
def visualizarDados():
    ver_dados = []
    with conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Album"
        cur.execute(query)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_dados.append(linha)
    
    return ver_dados

def verLinha(id):
    ver_linha = []
    with conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Album WHERE id=?"
        cur.execute(query, id)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_linha.append(linha)
        
    return ver_linha
