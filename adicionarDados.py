import sqlite3 as lite

# Criando conexão
conexao = lite.connect('bd_hitnote.db')

# Inserindo dados 
dados = ['thayna', 'thayna-gimenez', 'thayna', 'thaynagimenez@gmail.com']
with conexao:
    cur = conexao.cursor()
    query = "INSERT INTO Usuario(nome, username, senha, email) VALUES(?,?,?,?)"
    cur.execute(query, dados)

# Atualizando dados
novos_dados = ['maria', 'maria-pagliosa', 'maria', 'mariapagliosa@gmail.com', 2]
with conexao:
    cur = conexao.cursor()
    query = "UPDATE Usuario SET nome=?, username=?, senha=?, email=? WHERE id=?"
    cur.execute(query, novos_dados)

# Deletando dados
deletar_dados = str(2)
with conexao:
    cur = conexao.cursor()
    query = "DELETE FROM Usuario WHERE id=?"
    cur.execute(query, deletar_dados)

# Vendo dados
ver_dados = []
with conexao:
    cur = conexao.cursor()
    query = "SELECT * FROM Usuario"
    cur.execute(query)

    linhas = cur.fetchall()
    for linha in linhas:
        ver_dados.append(linha)

print(ver_dados)