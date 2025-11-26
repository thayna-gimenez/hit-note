from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Tuple, Optional

import httpx
from config import GENIUS_CLIENT_SECRET, GENIUS_CLIENT_ID, GENIUS_ACCESS_TOKEN, GENIUS_API_URL

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
    obterMusicaPorDados
)

from crud.crud_usuario import (
    criarTabelaUsuario,
    inserirDados as usuario_insert,
    obter_usuario_por_email,
    obter_perfil_por_id,
    atualizar_perfil,
    obter_estatisticas_usuario,
    hash_password,
    verify_password,
    verificar_curtida,
    alternar_curtida,
    listar_musicas_curtidas,
    pesquisar_usuarios,
    obter_perfil_publico,
    verificar_seguindo,
    alternar_seguir
)

# from crud.crud_album import criarTabelaAlbum
from crud.crud_review import (
    criarTabelaReview,
    inserirReview,
    listarReviewsPorMusica,
    obterReviewPorId,
    deletarDados as review_delete
)

from crud.crud_lista import (
    criarTabelaLista, 
    criar_lista, 
    listar_listas_usuario, 
    deletar_lista,
    obter_lista_por_id,
    adicionar_musica_lista,
    remover_musica_lista,
    obter_musicas_da_lista,
    editar_lista
)

from crud.crud_feed import obter_feed_usuario 

app = FastAPI(title="HitNote API")

@app.on_event("startup")
def on_startup():
    print("Iniciando a aplicação e criando tabelas...")
    criarTabelaMusica()
    criarTabelaReview()
    criarTabelaUsuario()
    criarTabelaLista()
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
    data_lancamento: Optional[str] = ""
    url_imagem: Optional[str] = ""

class MusicaOut(MusicaIn):
    id: int

class MusicaProfileOut(BaseModel):
    id: int
    nome: str
    artista: str
    album: Optional[str] = None
    data_lancamento: Optional[str] = None
    url_imagem: Optional[str] = None
    user_rating: Optional[float] = None
    
def rows_to_musicas(rows: List[Tuple]) -> List[MusicaOut]:
    return [
        MusicaOut(
            id=r[0], 
            nome=r[1], 
            artista=r[2], 
            album=r[3], 
            data_lancamento=r[4], 
            url_imagem=r[5]
        ) 
        for r in rows
    ]
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
    musica_existente = obterMusicaPorDados(data.nome, data.artista, data.album)
    
    if musica_existente:
        print(f"Música '{data.nome}' já existe. Retornando ID {musica_existente[0]}.")
        return rows_to_musicas([musica_existente])[0]

    musica_insert([data.nome, data.artista, data.album, data.data_lancamento, data.url_imagem])
    
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM Musica ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        
    return rows_to_musicas([row])[0]

@app.put("/musicas/{id}", response_model=MusicaOut)
def update_musica(id: int, data: MusicaIn):
    # garante que existe
    _ = get_musica(id)
    musica_update([data.nome, data.artista, data.album, data.data_lancamento, id])
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

            r_date = track.get("release_date") or track.get("release_date_for_display") or "Data desc."

            results.append({
                "genius_id": track.get("id"),
                "nome": track.get("title"),
                "artista": track.get("primary_artist", {}).get("name"),
                "album": album_name,
                "data_lancamento": r_date,
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
    autor_id: int

def row_to_review(row: Tuple) -> ReviewOut:
    # row vem do JOIN: (id, musica, nota, comentario, nome_usuario)
    # Se nome_usuario for None (usuário deletado), colocamos um aviso
    nome_autor = row[4] if row[4] else "Usuário Deletado"
    
    return ReviewOut(
        id=row[0], 
        musica=row[1], 
        nota=row[2], 
        comentario=row[3],
        autor=nome_autor,
        autor_id=row[5]
    )

@app.get("/musicas/{id}/reviews", response_model=List[ReviewOut])
def list_reviews_by_musica(id: int):
    m = get_musica(id)
    
    rows = listarReviewsPorMusica(m.nome)
    
    return [row_to_review(r) for r in rows]

@app.post("/musicas/{id}/reviews", response_model=ReviewOut, status_code=201)
def create_review_for_musica(id: int, data: ReviewIn, current_user: tuple = Depends(get_current_user)):
    """
    Cria um review vinculado ao usuário logado.
    Se não enviar token válido, retorna 401 Unauthorized.
    """
    
    m = get_musica(id) 
    
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
    return {"musica_id": id, "media": avg, "qtde": cnt}


# ----------------------------- Usuários/Auth -----------------------------

class UsuarioStats(BaseModel):
    total_reviews: int
    media_reviews: float
    followers: int
    following: int
    likes: int
class UsuarioIn(BaseModel):
    nome: str
    username: str
    email: str
    senha: str

class UsuarioOut(BaseModel):
    id: int
    nome: str
    username: str
    email: str

class UsuarioProfileOut(BaseModel):
    id: int
    nome: str
    username: str
    email: str
    biografia: Optional[str] = ""
    url_foto: Optional[str] = ""
    url_capa: Optional[str] = ""
    localizacao: Optional[str] = ""
    data_cadastro: Optional[str] = ""
    stats: UsuarioStats
    
class UsuarioPublico(BaseModel):
    id: int
    nome: str
    username: str
    url_foto: Optional[str] = None
    biografia: Optional[str] = None
    is_following: Optional[bool] = False  

class UsuarioPerfilFull(UsuarioPublico):
    url_capa: Optional[str] = None
    localizacao: Optional[str] = None
    data_cadastro: Optional[str] = ""
    stats: dict = {}  
    
class LoginIn(BaseModel):
    """Modelo para Login."""
    email: str
    senha: str

class TokenOut(BaseModel):
    """Modelo de Saída após o Login (Token)."""
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut # para retornar dados do usuário logado

class UsuarioProfileUpdate(BaseModel):
    nome: str
    biografia: str
    url_foto: str
    url_capa: str
    localizacao: str

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
        usuario_insert(data.nome, data.username, data.email, hashed_password)
        
        novo_usuario_db = obter_usuario_por_email(data.email)
        
        return UsuarioOut(
            id=novo_usuario_db[0], 
            nome=novo_usuario_db[1], 
            username=novo_usuario_db[2],
            email=novo_usuario_db[3] 
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
        
    id_user, nome, username, email, senha_hash = usuario_db
    
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
    
    usuario_out = UsuarioOut(id=id_user, nome=nome, username=username, email=email)
    
    return TokenOut(access_token=access_token, usuario=usuario_out)

@app.get("/usuarios/me", response_model=UsuarioProfileOut)
def ler_meu_perfil(current_user: tuple = Depends(get_current_user)):
    """Retorna o perfil completo do usuário logado."""
    user_id = current_user[0]
    
    dados = obter_perfil_por_id(user_id)
    
    if not dados:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
    estatisticas = obter_estatisticas_usuario(user_id)
    
    return UsuarioProfileOut(
        id=dados[0],
        nome=dados[1],
        username=dados[2],
        email=dados[3],
        biografia=dados[4],
        url_foto=dados[5],
        url_capa=dados[6],
        localizacao=dados[7],
        data_cadastro=dados[8],
        stats=estatisticas
    )
    
@app.put("/usuarios/me", response_model=UsuarioProfileOut)
def atualizar_meu_perfil(
    data: UsuarioProfileUpdate, 
    current_user: tuple = Depends(get_current_user)
):
    """Atualiza os dados do perfil do usuário logado."""
    user_id = current_user[0]
    
    atualizar_perfil(user_id, data.nome, data.biografia, data.url_foto, data.url_capa, data.localizacao)
        
    return ler_meu_perfil(current_user)

# ----------------------------- Favoritas -----------------------------

@app.get("/musicas/{id}/like")
def get_like_status(id: int, current_user: tuple = Depends(get_current_user)):
    """Verifica se o usuário logado curtiu a música."""
    m = get_musica(id)
    user_id = current_user[0]
    
    is_liked = verificar_curtida(user_id, m.nome)
    return {"is_liked": is_liked}

@app.post("/musicas/{id}/like")
def toggle_like(id: int, current_user: tuple = Depends(get_current_user)):
    """Dá like ou remove like."""
    m = get_musica(id)
    user_id = current_user[0]
    
    novo_estado = alternar_curtida(user_id, m.nome)
    return {"is_liked": novo_estado}

@app.get("/usuarios/me/curtidas", response_model=List[MusicaProfileOut])
def get_my_likes(current_user: tuple = Depends(get_current_user)):
    """Retorna a lista de músicas favoritas do usuário com a nota pessoal."""
    try:
        user_id = current_user[0]
        rows = listar_musicas_curtidas(user_id)
        
        lista_formatada = []
        for row in rows:
            musica = {
                "id": row[0],
                "nome": row[1],
                "artista": row[2],
                "album": row[3] if row[3] else "Single",
                "data_lancamento": row[4] if row[4] else "",
                "url_imagem": row[5] if row[5] else "",
                "user_rating": row[6] if row[6] is not None else 0
            }
            lista_formatada.append(musica)
            
        return lista_formatada

    except Exception as e:
        print(f"ERRO NO BACKEND: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# --- Adicione logo abaixo de get_my_likes ---

@app.get("/usuarios/{user_id}/curtidas", response_model=List[MusicaProfileOut])
def get_user_likes(user_id: int):
    """
    Retorna as músicas favoritas de QUALQUER usuário pelo ID.
    Útil para o Perfil Público.
    """
    try:
        # Reusa a mesma lógica do banco de dados que já funciona
        rows = listar_musicas_curtidas(user_id)
        
        lista_formatada = []
        for row in rows:
            musica = {
                "id": row[0],
                "nome": row[1],
                "artista": row[2],
                "album": row[3] if row[3] else "Single",
                "data_lancamento": row[4] if row[4] else "",
                "url_imagem": row[5] if row[5] else "",
                # Aqui row[6] é a nota que ESSE usuário (user_id) deu
                "user_rating": row[6] if row[6] is not None else 0
            }
            lista_formatada.append(musica)
            
        return lista_formatada

    except Exception as e:
        print(f"ERRO NO BACKEND: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# --- SEGUIDORES ---

@app.get("/usuarios/busca", response_model=List[UsuarioPublico])
def search_users(q: str):
    """Busca usuários pelo nome."""
    rows = pesquisar_usuarios(q)
    resultados = []
    for row in rows:
        resultados.append({
            "id": row[0],
            "nome": row[1],
            "username": row[2],
            "url_foto": row[3],
            "biografia": row[4],
            "is_following": False 
        })
    return resultados

@app.get("/usuarios/{id}", response_model=UsuarioPerfilFull)
def get_user_profile(id: int, current_user: tuple = Depends(get_current_user)):
    """Pega o perfil de OUTRO usuário e verifica se eu sigo ele."""
    meu_id = current_user[0]
    
    perfil = obter_perfil_publico(id)
    if not perfil:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    segue = verificar_seguindo(meu_id, id)
    perfil['is_following'] = segue
    
    return perfil

@app.post("/usuarios/{id}/seguir")
def toggle_follow_route(id: int, current_user: tuple = Depends(get_current_user)):
    """Seguir / Deixar de seguir."""
    meu_id = current_user[0]
    try:
        novo_estado = alternar_seguir(meu_id, id)
        return {"is_following": novo_estado}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# --- LISTAS (PLAYLISTS) ---

class ListaIn(BaseModel):
    nome: str
    descricao: Optional[str] = ""
    publica: bool = True

class ListaOut(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    url_capa: Optional[str]
    publica: bool
    song_count: int = 0
    usuario_id: int

class ListaItemOut(BaseModel):
    id: int
    nome: str
    artista: str
    album: str
    url_imagem: Optional[str]
    adicionado_em: str

class ListaFullOut(ListaOut):
    items: List[ListaItemOut]

@app.post("/listas", response_model=ListaOut, status_code=201)
def create_lista_route(data: ListaIn, current_user: tuple = Depends(get_current_user)):
    """Cria uma nova lista para o usuário logado."""
    user_id = current_user[0]
    new_id = criar_lista(user_id, data.nome, data.descricao, data.publica)
    
    return ListaOut(
        id=new_id,
        nome=data.nome,
        descricao=data.descricao,
        url_capa=None,
        publica=data.publica,
        song_count=0,
        usuario_id=user_id
    )

@app.get("/usuarios/{user_id}/listas", response_model=List[ListaOut])
def get_user_lists_route(user_id: int, current_user: Optional[Tuple[int, str]] = Depends(get_current_user)):
    """Retorna as listas de um usuário."""
    meu_id = current_user[0] if current_user else None
    sou_dono = (meu_id == user_id)
    
    rows = listar_listas_usuario(user_id, apenas_publicas=not sou_dono)
    
    results = []
    for row in rows:
        results.append(ListaOut(
            id=row[0],
            nome=row[1],
            descricao=row[2],
            url_capa=row[3],
            publica=bool(row[4]),
            song_count=row[6],
            usuario_id=user_id 
        ))
    return results

@app.delete("/listas/{lista_id}", status_code=204)
def delete_lista_route(lista_id: int, current_user: tuple = Depends(get_current_user)):
    """Apaga uma lista inteira."""
    user_id = current_user[0]
    sucesso = deletar_lista(lista_id, user_id)
    if not sucesso:
        raise HTTPException(status_code=403, detail="Não permitido ou lista não encontrada.")
    return

@app.put("/listas/{lista_id}", response_model=ListaOut)
def update_lista_route(lista_id: int, data: ListaIn, current_user: Optional[Tuple[int, str]] = Depends(get_current_user)):
    """Atualiza o nome, descrição e privacidade de uma lista."""
    if not current_user: 
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    user_id = current_user[0]

    sucesso = editar_lista(lista_id, user_id, data.nome, data.descricao, data.publica)
    
    if not sucesso:
        lista_existente = obter_lista_por_id(lista_id)
        if not lista_existente:
             raise HTTPException(status_code=404, detail="Lista não encontrada.")
        else:
             raise HTTPException(status_code=403, detail="Você não tem permissão para editar esta lista.")
    
    lista_recarregada = obter_lista_por_id(lista_id)
    
    return ListaOut(
        id=lista_id,
        nome=data.nome,
        descricao=data.descricao,
        url_capa=lista_recarregada[3],
        publica=data.publica,
        song_count=0, 
        usuario_id=user_id
    )

@app.get("/listas/{lista_id}", response_model=ListaFullOut)
def get_lista_details(lista_id: int):
    """Retorna os detalhes da lista e suas músicas."""
    lista = obter_lista_por_id(lista_id)
    if not lista:
        raise HTTPException(status_code=404, detail="Lista não encontrada")
    
    musicas_raw = obter_musicas_da_lista(lista_id)
    
    items = []
    for m in musicas_raw:
        items.append({
            "id": m[0],
            "nome": m[1],
            "artista": m[2],
            "album": m[3],
            "url_imagem": m[4],
            "data_lancamento": m[5],
            "adicionado_em": str(m[6])
        })

    return {
        "id": lista[0],
        "nome": lista[1],
        "descricao": lista[2],
        "url_capa": lista[3],
        "publica": bool(lista[4]),
        "usuario_id": lista[6], 
        "items": items,
        "song_count": len(items)
    }

@app.post("/listas/{lista_id}/musicas/{musica_id}", status_code=201)
def add_music_to_list(lista_id: int, musica_id: int, current_user: tuple = Depends(get_current_user)):
    """Adiciona uma música à lista."""
    lista = obter_lista_por_id(lista_id)
    if not lista:
        raise HTTPException(404, "Lista não encontrada")
    
    if lista[6] != current_user[0]: 
        raise HTTPException(403, "Você não é dono desta lista")

    adicionar_musica_lista(lista_id, musica_id)
    return {"msg": "Adicionado com sucesso"}

@app.delete("/listas/{lista_id}/musicas/{musica_id}", status_code=204)
def remove_music_from_list(lista_id: int, musica_id: int, current_user: tuple = Depends(get_current_user)):
    """Remove uma música da lista."""
    lista = obter_lista_por_id(lista_id)
    
    if not lista:
        raise HTTPException(404, "Lista não encontrada")
        
    if lista[6] != current_user[0]:
        raise HTTPException(403, "Não permitido")

    remover_musica_lista(lista_id, musica_id)
    return

# ----------------------------- Feed -------------------------------------
class ActivityItemOut(BaseModel):
    id: str 
    tipo: str 
    data_criacao: Optional[str] = None
    acao: str 
    target_id: int 
    nota: Optional[int] = None
    comentario: Optional[Optional[str]] = None

@app.get("/usuarios/{user_id}/feed", response_model=List[ActivityItemOut])
def get_user_feed_route(user_id: int):
    """Retorna a atividade recente (reviews e listas) de um usuário."""
    feed = obter_feed_usuario(user_id)
    return feed