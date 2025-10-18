import sqlite3 as lite

# Criando conexão
conexao = lite.connect('bd_hitnote.db')

# Criando tabela
with conexao:
    cur = conexao.cursor()
    # cur.execute("DROP TABLE Usuario")
    cur.execute("CREATE TABLE Usuario(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, username TEXT, senha TEXT, email TEXT)")