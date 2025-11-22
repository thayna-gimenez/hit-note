import sqlite3 as lite
from datetime import datetime
from bd import get_connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------- Funções de Segurança --------------------------

def hash_password(password: str) -> str:
    """
    Criptografa a senha usando bcrypt.
    
    IMPORTANTE: O bcrypt tem um limite estrito de 72 bytes. Senhas maiores causam erro.
    Truncamos a senha em 72 bytes antes de passar para o hash.
    """
    # Codifica para bytes e corta nos primeiros 72 bytes
    # Isso evita o ValueError: password cannot be longer than 72 bytes
    truncated_password_bytes = password.encode('utf-8')[:72]
    
    return pwd_context.hash(truncated_password_bytes)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha em texto puro corresponde ao hash.
    """
    # Precisamos aplicar o mesmo truncamento na verificação.
    truncated_password_bytes = plain_password.encode('utf-8')[:72]
    
    return pwd_context.verify(truncated_password_bytes, hashed_password)

# -------------------------- Funções CRUD --------------------------
# Criando tabela
def criarTabelaUsuario():
    with get_connection() as conexao:
        cur = conexao.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS Usuario(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome TEXT, 
            email TEXT UNIQUE, 
            senha_hash TEXT,
            biografia TEXT,
            url_foto TEXT,
            url_capa TEXT,
            localizacao TEXT,
            data_cadastro TEXT)""")
        
    cur.execute("""
            CREATE TABLE IF NOT EXISTS Seguidores(
                seguidor_id INTEGER,
                seguido_id INTEGER,
                PRIMARY KEY(seguidor_id, seguido_id),
                FOREIGN KEY(seguidor_id) REFERENCES Usuario(id),
                FOREIGN KEY(seguido_id) REFERENCES Usuario(id)
            )
        """)
    
    cur.execute("""
            CREATE TABLE IF NOT EXISTS Curtida(
                usuario_id INTEGER,
                musica_nome TEXT, 
                PRIMARY KEY(usuario_id, musica_nome),
                FOREIGN KEY(usuario_id) REFERENCES Usuario(id)
            )
        """)    

# Inserindo dados 
def inserirDados(nome, email, senha_hash):
    """Insere um novo usuário no banco."""
    try:
        data_hoje = datetime.now().strftime("%Y-%m-%d")
        
        with get_connection() as conexao:
            cur = conexao.cursor()
            query = """
            INSERT INTO Usuario(nome, email, senha_hash, biografia, url_foto, url_capa, localizacao, data_cadastro) 
            VALUES(?,?,?, '', '', '', '', ?)
            """
            cur.execute(query, (nome, email, senha_hash, data_hoje))
            conexao.commit()
    except lite.IntegrityError:
        print(f"Erro: O email {email} já está cadastrado.")
        raise
    except Exception as e:
        print(f"Erro ao inserir dados: {e}")
        raise

def obter_perfil_por_id(id):
    """Retorna dados do perfil + data_cadastro + localizacao."""
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = """
            SELECT id, nome, email, biografia, url_foto, url_capa, localizacao, data_cadastro 
            FROM Usuario WHERE id=?
        """
        cur.execute(query, (id,))
        return cur.fetchone()
    
def obter_usuario_por_email(email):
    # Retorna (id, nome, email, senha_hash) ou None
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT id, nome, email, senha_hash FROM Usuario WHERE email=?"
        cur.execute(query, (email,))
        return cur.fetchone()
    
def atualizar_perfil(id, nome, biografia, url_foto, url_capa, localizacao):
    """Atualiza dados editáveis do perfil."""
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = """
            UPDATE Usuario 
            SET nome=?, biografia=?, url_foto=?, url_capa=?, localizacao=?
            WHERE id=?
        """
        cur.execute(query, (nome, biografia, url_foto, url_capa, localizacao, id))
        conexao.commit()
        
# --- Estatísticas ---

def obter_estatisticas_usuario(user_id):
    """Calcula: Total Reviews, Média Nota, Seguidores, Curtidas."""
    stats = {}
    with get_connection() as con:
        cur = con.cursor()
        
        # 1. Total de Avaliações e Média
        cur.execute("SELECT COUNT(*), AVG(nota) FROM Review WHERE usuario_id=?", (user_id,))
        total_reviews, media_reviews = cur.fetchone()
        stats['total_reviews'] = total_reviews or 0
        stats['media_reviews'] = media_reviews or 0.0

        # 2. Total de Seguidores (quantas pessoas seguem esse user_id)
        cur.execute("SELECT COUNT(*) FROM Seguidores WHERE seguido_id=?", (user_id,))
        stats['followers'] = cur.fetchone()[0]

        # 3. Total de Curtidas (quantas músicas esse usuário curtiu)
        cur.execute("SELECT COUNT(*) FROM Curtida WHERE usuario_id=?", (user_id,))
        stats['likes'] = cur.fetchone()[0]
        
    return stats

# --- FUNÇÕES DE CURTIDA ---

def verificar_curtida(usuario_id, musica_nome):
    """Retorna True se o usuário já curtiu a música."""
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT 1 FROM Curtida WHERE usuario_id=? AND musica_nome=?", 
            (usuario_id, musica_nome)
        )
        return cur.fetchone() is not None

def alternar_curtida(usuario_id, musica_nome):
    """
    Se já curtiu, remove (dislike).
    Se não curtiu, adiciona (like).
    Retorna True se ficou curtido, False se foi removido.
    """
    liked = verificar_curtida(usuario_id, musica_nome)
    
    with get_connection() as con:
        cur = con.cursor()
        if liked:
            cur.execute(
                "DELETE FROM Curtida WHERE usuario_id=? AND musica_nome=?", 
                (usuario_id, musica_nome)
            )
            con.commit()
            return False 
        else:
            cur.execute(
                "INSERT INTO Curtida(usuario_id, musica_nome) VALUES(?,?)", 
                (usuario_id, musica_nome)
            )
            con.commit()
            return True 
    
def listar_musicas_curtidas(usuario_id):
    """
    Retorna a lista de músicas curtidas, buscando a nota (review) 
    pelo NOME da música.
    """
    with get_connection() as con:
        cur = con.cursor()
        
        query = """
            SELECT 
                m.id, 
                m.nome, 
                m.artista, 
                m.album, 
                m.data_lancamento, 
                m.url_imagem,
                r.nota  
            FROM Musica m
            JOIN Curtida c ON m.nome = c.musica_nome
            LEFT JOIN Review r ON m.nome = r.musica AND r.usuario_id = c.usuario_id
            WHERE c.usuario_id = ?
            ORDER BY m.id DESC
        """
        cur.execute(query, (usuario_id,))
        return cur.fetchall()