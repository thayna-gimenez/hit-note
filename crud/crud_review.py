import sqlite3 as lite

# Criando conexão
conexao = lite.connect('bd_hitnote.db')

# Criando tabela
def criarTabelaReview():
    with conexao:
        cur = conexao.cursor()
        # cur.execute("DROP TABLE Review")
        cur.execute("CREATE TABLE Review(id INTEGER PRIMARY KEY AUTOINCREMENT, musica TEXT, nota FLOAT, comentario TEXT)")


# Inserindo dados 
def inserirDados(dados):
    with conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Review(musica, nota, comentario) VALUES(?,?,?)"
        cur.execute(query, dados)

# Atualizando dados
def atualizarDados(novos_dados):
    with conexao:
        cur = conexao.cursor()
        query = "UPDATE Review SET musica=?, nota=?, comentario=? WHERE id=?"
        cur.execute(query, novos_dados)

# Deletando dados
def deletarDados(id):
    with conexao:
        cur = conexao.cursor()
        query = "DELETE FROM Review WHERE id=?"
        cur.execute(query, id)

# Vendo dados
def visualizarDados():
    ver_dados = []
    with conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Review"
        cur.execute(query)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_dados.append(linha)
    
    return ver_dados

def verLinha(id):
    ver_linha = []
    with conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Review WHERE id=?"
        cur.execute(query, id)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_linha.append(linha)
        
    return ver_linha