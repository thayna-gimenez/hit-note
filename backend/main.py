from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bd import get_connection

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

from pydantic import BaseModel
from typing import List, Tuple

app = FastAPI(title="HitNote API (músicas v1)")

@app.on_event("startup")
def on_startup():
    print("Iniciando a aplicação e criando tabelas...")
    criarTabelaMusica()
    criarTabelaAlbum()
    criarTabelaReview()
    criarTabelaUsuario()
    print("Tabelas prontas.")

# Libera o front local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

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

@app.get("/musicas", response_model=List[MusicaOut])
def list_musicas():
    return rows_to_musicas(musica_list())

@app.get("/musicas/{id}", response_model=MusicaOut)
def get_musica(id: int):
    r = musica_get((id,))
    if not r:
        raise HTTPException(status_code=404, detail="Música não encontrada")
    return rows_to_musicas([r[0]])[0]

@app.post("/musicas", response_model=MusicaOut, status_code=201)
def create_musica(data: MusicaIn):
    musica_insert([data.nome, data.artista, data.album, data.duracao])
    # pegar a última inserida direto no SQLite
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM Musica ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
    return rows_to_musicas([row])[0]

@app.put("/musicas/{id}", response_model=MusicaOut)
def update_musica(id: int, data: MusicaIn):
    musica_update([data.nome, data.artista, data.album, data.duracao, id])
    return get_musica(id)

@app.delete("/musicas/{id}", status_code=204)
def delete_musica(id: int):
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