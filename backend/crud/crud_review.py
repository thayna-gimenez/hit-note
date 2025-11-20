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
                comentario TEXT,
                usuario_id INTEGER,
                FOREIGN KEY(usuario_id) REFERENCES Usuario(id)
            )
        """)

def inserirReview(musica_nome, nota, comentario, usuario_id):
    """Insere um review vinculando ao ID do usuário logado."""
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "INSERT INTO Review(musica, nota, comentario, usuario_id) VALUES(?,?,?,?)"
        cur.execute(query, (musica_nome, nota, comentario, usuario_id))
        # Retorna o ID da linha que acabou de ser criada
        return cur.lastrowid
    
def listarReviewsPorMusica(musica_nome):
    """
    Retorna lista de reviews fazendo JOIN com a tabela de usuários 
    para obter o nome do autor.
    Retorno: [(id, musica, nota, comentario, nome_autor), ...]
    """
    with get_connection() as conexao:
        cur = conexao.cursor()
        sql = """
            SELECT r.id, r.musica, r.nota, r.comentario, u.nome
            FROM Review r
            LEFT JOIN Usuario u ON r.usuario_id = u.id
            WHERE r.musica = ?
            ORDER BY r.id DESC
        """
        cur.execute(sql, (musica_nome,))
        return cur.fetchall()

def obterReviewPorId(review_id):
    with get_connection() as conexao:
        cur = conexao.cursor()
        sql = """
            SELECT r.id, r.musica, r.nota, r.comentario, u.nome
            FROM Review r
            LEFT JOIN Usuario u ON r.usuario_id = u.id
            WHERE r.id = ?
        """
        cur.execute(sql, (review_id,))
        return cur.fetchone()
    
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

# def visualizarDados():
#     ver_dados = []
#     with get_connection() as conexao:
#         cur = conexao.cursor()
#         query = "SELECT * FROM Review"
#         cur.execute(query)
#         linhas = cur.fetchall()
#         for linha in linhas:
#             ver_dados.append(linha)
#     return ver_dados

# def verLinha(id):
#     ver_linha = []
#     with get_connection() as conexao:
#         cur = conexao.cursor()
#         query = "SELECT * FROM Review WHERE id=?"
#         cur.execute(query, id)
#         linhas = cur.fetchall()
#         for linha in linhas:
#             ver_linha.append(linha)
#     return ver_linha
