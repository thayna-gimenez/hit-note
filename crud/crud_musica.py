import sqlite3 as lite

# Criando conexão
conexao = lite.connect('bd_hitnote.db')

# Criando tabela
def criarTabela():
    with conexao:
        cur = conexao.cursor()
        # cur.execute("DROP TABLE Musica")
        cur.execute("CREATE TABLE Musica(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, artista TEXT, album TEXT, duracao TEXT)")


# Inserindo dados 
def inserirDados(dados):
    with conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Musica(nome, artista, album, duracao) VALUES(?,?,?,?)"
        cur.execute(query, dados)

# Atualizando dados
def atualizarDados(novos_dados):
    with conexao:
        cur = conexao.cursor()
        query = "UPDATE Musica SET nome=?, artista=?, album=?, duracao=? WHERE id=?"
        cur.execute(query, novos_dados)

# Deletando dados
def deletarDados(id):
    with conexao:
        cur = conexao.cursor()
        query = "DELETE FROM Musica WHERE id=?"
        cur.execute(query, id)

# Vendo dados
def visualizarDados():
    ver_dados = []
    with conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Musica"
        cur.execute(query)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_dados.append(linha)
    
    return ver_dados

def verLinha(id):
    ver_linha = []
    with conexao:
        cur = conexao.cursor()
        query = "SELECT * FROM Musica WHERE id=?"
        cur.execute(query, id)

        linhas = cur.fetchall()
        for linha in linhas:
            ver_linha.append(linha)
        
    return ver_linha


dados = ['Maroon', 'Taylor Swift', 'Midnights', '3m38s']
criarTabela()
inserirDados(dados)
vis = visualizarDados()
print(vis)