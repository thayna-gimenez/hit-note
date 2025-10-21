import sqlite3 as lite
from crud.crud_album import*
from crud.crud_musica import*
from crud.crud_review import*
from crud.crud_usuario import*

# Criando conexão
conexao = lite.connect('bd_hitnote.db')

criarTabelaMusica()
criarTabelaAlbum()
criarTabelaReview()
criarTabelaUsuario()