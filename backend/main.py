from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Tuple, Optional

import httpx
from config import GENIUS_CLIENT_SECRET, GENIUS_CLIENT_ID, GENIUS_ACCESS_TOKEN, GENIUS_API_URL

from crud.crud_musica import criarTabelaMusica
from crud.crud_album import criarTabelaAlbum
from crud.crud_review import criarTabelaReview
from crud.crud_usuario import criarTabelaUsuario

from crud.crud_musica import visualizarDados as musica_list
from crud.crud_musica import inserirDados as musica_insert
from crud.crud_musica import verLinha as musica_get
from crud.crud_musica import atualizarDados as musica_update
from crud.crud_musica import deletarDados as musica_delete
from bd import get_connection

from datetime import timedelta

from auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

from crud.crud_musica import (
    criarTabelaMusica,
    visualizarDados as musica_list,
    inserirDados as musica_insert,
    verLinha as musica_get,
    atualizarDados as musica_update,
    deletarDados as musica_delete,
    contar_busca,
    listar_busca,
)

from crud.crud_usuario import (
    criarTabelaUsuario,
    inserirDados as usuario_insert,
    obter_usuario_por_email,
    hash_password,
    verify_password,
)

from crud.crud_album import criarTabelaAlbum
from crud.crud_review import (
    criarTabelaReview,
    inserirReview,
    listarReviewsPorMusica,
    obterReviewPorId,
    deletarDados as review_delete #DEPOIS?
)

app = FastAPI(title="HitNote API")

@app.on_event("startup")
def on_startup():
    print("Iniciando a aplicação e criando tabelas...")
    criarTabelaMusica()
    criarTabelaAlbum()
    criarTabelaReview()
    criarTabelaUsuario()
    print("Tabelas prontas.")

# Libera o front local
# CORS liberado em dev; em prod, restrinja para o host do front
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ex.: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------- Health --------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ----------------------------- Músicas -------------------------------------
class MusicaIn(BaseModel):
    nome: str
    artista: str
    album: str
    duracao: str

class MusicaOut(MusicaIn):
    id: int

def rows_to_musicas(rows: List[Tuple]) -> List[MusicaOut]:
    # rows: [(id, nome, artista, album, duracao), ...]
    return [MusicaOut(id=r[0], nome=r[1], artista=r[2], album=r[3], duracao=r[4]) for r in rows]

class MusicaPage(BaseModel):
    items: List[MusicaOut]
    total: int
    page: int
    page_size: int

@app.get("/musicas", response_model=MusicaPage)
def list_musicas(
    q: Optional[str] = Query(None, description="Busca por nome/artista/album"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    order: str = Query("id_desc", pattern="^(id_asc|id_desc|nome_asc|nome_desc)$"),
):
    total = contar_busca(q)
    offset = (page - 1) * page_size
    rows = listar_busca(q, order, page_size, offset)
    return MusicaPage(items=rows_to_musicas(rows), total=total, page=page, page_size=page_size)

@app.get("/musicas/{id}", response_model=MusicaOut)
def get_musica(id: int):
    r = musica_get((id,))
    if not r:
        raise HTTPException(status_code=404, detail="Música não encontrada")
    return rows_to_musicas([r[0]])[0]

@app.post("/musicas", response_model=MusicaOut, status_code=201)
def create_musica(data: MusicaIn):
    musica_insert([data.nome, data.artista, data.album, data.duracao])
    # pega a última inserida direto no SQLite
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM Musica ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
    return rows_to_musicas([row])[0]

@app.put("/musicas/{id}", response_model=MusicaOut)
def update_musica(id: int, data: MusicaIn):
    # garante que existe
    _ = get_musica(id)
    musica_update([data.nome, data.artista, data.album, data.duracao, id])
    return get_musica(id)

@app.delete("/musicas/{id}", status_code=204)
def delete_musica(id: int):
    # garante que existe
    _ = get_musica(id)
    musica_delete((id,))
    return

@app.get("/api/v1/search-genius")
async def search_genius(query: str):
    """
    Busca músicas na API do Genius.
    """
    if not GENIUS_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="API do Genius não configurada no servidor.")

    headers = {"Authorization": f"Bearer {GENIUS_ACCESS_TOKEN}"}
    params = {"q": query}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{GENIUS_API_URL}/search", headers=headers, params=params)
            
            response.raise_for_status() 
        
        data = response.json()
        results = []
        
        # O Genius retorna "hits", cada "hit" tem um "result"
        for hit in data.get("response", {}).get("hits", []):
            track = hit.get("result", {})
            
            # Às vezes o Genius não tem um álbum associado
            album_name = track.get("album", {}).get("name") if track.get("album") else "Single"

            results.append({
                "genius_id": track.get("id"),
                "nome": track.get("title"),
                "artista": track.get("primary_artist", {}).get("name"),
                "album": album_name,
                "url_imagem_capa": track.get("song_art_image_thumbnail_url"),
            })
        
        return results

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, 
            detail=f"Erro ao buscar no Genius: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
# ----------------------------- Reviews -------------------------------------
# Mantendo o design atual do DB: Review.musica = NOME da música (string)
class ReviewIn(BaseModel):
    nota: float = Field(ge=0, le=5)
    comentario: str

class ReviewOut(ReviewIn):
    id: int
    musica: str  # nome da música
    autor: str

def row_to_review(row: Tuple) -> ReviewOut:
    # row vem do JOIN: (id, musica, nota, comentario, nome_usuario)
    # Se nome_usuario for None (usuário deletado), colocamos um aviso
    nome_autor = row[4] if row[4] else "Usuário Deletado"
    
    return ReviewOut(
        id=row[0], 
        musica=row[1], 
        nota=row[2], 
        comentario=row[3],
        autor=nome_autor
    )

@app.get("/musicas/{id}/reviews", response_model=List[ReviewOut])
def list_reviews_by_musica(id: int):
    # Descobre o NOME da música a partir do id
    m = get_musica(id)  # lança 404 se não existir
    
    rows = listarReviewsPorMusica(m.nome)
    
    return [row_to_review(r) for r in rows]

@app.post("/musicas/{id}/reviews", response_model=ReviewOut, status_code=201)
def create_review_for_musica(id: int, data: ReviewIn, current_user: tuple = Depends(get_current_user)):
    """
    Cria um review vinculado ao usuário logado.
    Se não enviar token válido, retorna 401 Unauthorized.
    """
    
    m = get_musica(id)  # lança 404 se não existir
    
    usuario_id = current_user[0] 
    
    new_review_id = inserirReview(m.nome, data.nota, data.comentario, usuario_id)
    
    row = obterReviewPorId(new_review_id)
    
    return row_to_review(row)

@app.get("/musicas/{id}/rating")
def rating_by_musica(id: int):
    m = get_musica(id)
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT AVG(nota), COUNT(*) FROM Review WHERE musica=?", (m.nome,))
        avg, cnt = cur.fetchone()
    # avg pode ser None se não houver reviews
    return {"musica_id": id, "media": avg, "qtde": cnt}


# ----------------------------- Usuários/Auth -----------------------------

class UsuarioIn(BaseModel):
    """Modelo para Cadastro de Usuário."""
    nome: str
    email: str
    senha: str

class UsuarioOut(BaseModel):
    """Modelo de Saída para Usuário (Sem a senha)."""
    id: int
    nome: str
    email: str

class LoginIn(BaseModel):
    """Modelo para Login."""
    email: str
    senha: str

class TokenOut(BaseModel):
    """Modelo de Saída após o Login (Token)."""
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut # para retornar dados do usuário logado

@app.post("/usuarios", response_model=UsuarioOut, status_code=201, tags=["Usuários"])
def cadastrar_usuario(data: UsuarioIn):
    """RF001: Permite o cadastro de um novo usuário."""
    
    usuario_existente = obter_usuario_por_email(data.email)
    if usuario_existente:
        raise HTTPException(
            status_code=400, 
            detail="E-mail já cadastrado."
        )

    hashed_password = hash_password(data.senha)
    
    try:
        usuario_insert(data.nome, data.email, hashed_password)
        
        novo_usuario_db = obter_usuario_por_email(data.email)
        
        return UsuarioOut(
            id=novo_usuario_db[0], 
            nome=novo_usuario_db[1], 
            email=novo_usuario_db[2] 
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao inserir usuário: {str(e)}"
        )

@app.post("/login", response_model=TokenOut, tags=["Usuários"])
def login_usuario(data: LoginIn):
    """RF002: Permite que o usuário acesse o sistema."""
    
    usuario_db = obter_usuario_por_email(data.email)
    
    if not usuario_db:
        raise HTTPException(
            status_code=401, 
            detail="Credenciais inválidas."
        )
        
    id_user, nome, email, senha_hash = usuario_db
    
    if not verify_password(data.senha, senha_hash):
        raise HTTPException(
            status_code=401, 
            detail="Credenciais inválidas."
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        data={"sub": email, "id": id_user}, 
        expires_delta=access_token_expires
    )
    
    usuario_out = UsuarioOut(id=id_user, nome=nome, email=email)
    
    return TokenOut(access_token=access_token, usuario=usuario_out)