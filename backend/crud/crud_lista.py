from bd import get_connection

def criarTabelaLista():
    with get_connection() as conn:
        cur = conn.cursor()
        # Tabela de Listas
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Lista(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                url_capa TEXT,
                publica BOOLEAN DEFAULT 1,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usuario_id INTEGER,
                FOREIGN KEY(usuario_id) REFERENCES Usuario(id)
            )
        """)
        
        # Tabela de Associação (Lista <-> Musica)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ListaMusica(
                lista_id INTEGER,
                musica_id INTEGER,
                adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (lista_id, musica_id),
                FOREIGN KEY(lista_id) REFERENCES Lista(id) ON DELETE CASCADE,
                FOREIGN KEY(musica_id) REFERENCES Musica(id) ON DELETE CASCADE
            )
        """)

def criar_lista(usuario_id, nome, descricao, publica=True):
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO Lista(usuario_id, nome, descricao, publica) VALUES(?,?,?,?)", 
            (usuario_id, nome, descricao, publica)
        )
        return cur.lastrowid
    
def editar_lista(lista_id, usuario_id, nome, descricao, publica):
    """Atualiza nome, descrição e status de privacidade de uma lista, verificando o dono."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE Lista 
            SET nome = ?, descricao = ?, publica = ?
            WHERE id = ? AND usuario_id = ?
            """,
            (nome, descricao, publica, lista_id, usuario_id)
        )
        conn.commit()
        # Retorna True se alguma linha foi afetada (edição bem-sucedida)
        return cur.rowcount > 0

def listar_listas_usuario(usuario_id, apenas_publicas=False):
    """Retorna todas as listas de um usuário."""
    with get_connection() as conn:
        cur = conn.cursor()
        query = """
            SELECT l.id, l.nome, l.descricao, l.url_capa, l.publica, l.data_criacao,
                   (SELECT COUNT(*) FROM ListaMusica lm WHERE lm.lista_id = l.id) as qtd_musicas
            FROM Lista l
            WHERE l.usuario_id = ?
        """
        if apenas_publicas:
            query += " AND l.publica = 1"
            
        query += " ORDER BY l.id DESC"
        
        cur.execute(query, (usuario_id,))
        return cur.fetchall()

def obter_lista_por_id(lista_id):
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM Lista WHERE id = ?", (lista_id,))
        return cur.fetchone()

def adicionar_musica_lista(lista_id, musica_id):
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT OR IGNORE INTO ListaMusica(lista_id, musica_id) VALUES(?,?)", 
            (lista_id, musica_id)
        )
        conn.commit()

def remover_musica_lista(lista_id, musica_id):
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM ListaMusica WHERE lista_id=? AND musica_id=?", 
            (lista_id, musica_id)
        )
        conn.commit()

def deletar_lista(lista_id, usuario_id):
    """Deleta a lista se pertencer ao usuário."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM Lista WHERE id=? AND usuario_id=?", (lista_id, usuario_id))
        return cur.rowcount > 0
    
def obter_musicas_da_lista(lista_id):
    """Retorna as músicas contidas em uma lista específica."""
    with get_connection() as conn:
        cur = conn.cursor()
        query = """
            SELECT m.id, m.nome, m.artista, m.album, m.url_imagem, m.data_lancamento, lm.adicionado_em
            FROM Musica m
            JOIN ListaMusica lm ON m.id = lm.musica_id
            WHERE lm.lista_id = ?
            ORDER BY lm.adicionado_em DESC
        """
        cur.execute(query, (lista_id,))
        return cur.fetchall()