import sqlite3 as lite
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
        cur.execute("CREATE TABLE IF NOT EXISTS Usuario(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT UNIQUE, senha_hash TEXT)")

# Inserindo dados 
def inserirDados(nome, email, senha_hash):
    """Insere um novo usuário no banco."""
    try:
        with get_connection() as conexao:
            cur = conexao.cursor()
            query = "INSERT INTO Usuario(nome, email, senha_hash) VALUES(?,?,?)"
            cur.execute(query, (nome, email, senha_hash))
            conexao.commit()
    except lite.IntegrityError:
        print(f"Erro: O email {email} já está cadastrado.")
        raise
    except Exception as e:
        print(f"Erro ao inserir dados: {e}")
        raise

# # Atualizando dados
# def atualizarDados(novos_dados):
#     with get_connection() as conexao:
#         cur = conexao.cursor()
#         query = "UPDATE Usuario SET nome=?, username=?, senha=?, email=? WHERE id=?"
#         cur.execute(query, novos_dados)

# # Deletando dados
# def deletarDados(id):
#     with get_connection() as conexao:
#         cur = conexao.cursor()
#         query = "DELETE FROM Usuario WHERE id=?"
#         cur.execute(query, id)

# # Vendo dados
# def visualizarDados():
#     ver_dados = []
#     with get_connection() as conexao:
#         cur = conexao.cursor()
#         query = "SELECT * FROM Usuario"
#         cur.execute(query)

#         linhas = cur.fetchall()
#         for linha in linhas:
#             ver_dados.append(linha)
    
#     return ver_dados

def verLinha(id):
    # Retorna (id, nome, email, senha_hash) ou None
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT id, nome, email, senha_hash FROM Usuario WHERE id=?"
        cur.execute(query, (id,))
        return cur.fetchone()
    
def obter_usuario_por_email(email):
    # Retorna (id, nome, email, senha_hash) ou None
    with get_connection() as conexao:
        cur = conexao.cursor()
        query = "SELECT id, nome, email, senha_hash FROM Usuario WHERE email=?"
        cur.execute(query, (email,))
        return cur.fetchone()