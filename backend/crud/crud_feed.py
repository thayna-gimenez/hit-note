from bd import get_connection
from typing import List, Dict, Any, Tuple
import sqlite3

def obter_feed_usuario(usuario_id: int) -> List[Dict[str, Any]]:
    """
    Busca as atividades recentes (reviews e listas) de um usuário.
    Retorna uma lista de dicionários padronizados para o frontend.
    """
    
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()

        reviews_query = """
        SELECT 
            r.id, 'review' as tipo, r.nota, r.comentario,
            m.nome as musica_nome, m.artista, m.id as musica_id -- Pegamos o ID da música da tabela Musica
        FROM Review r
        JOIN Musica m ON r.musica = m.nome
        WHERE r.usuario_id = ?
        LIMIT 10
        """
        cur.execute(reviews_query, (usuario_id,))
        reviews_raw = cur.fetchall()
        
        feed = []

        # Mapeamento dos Reviews
        for r in reviews_raw:
            # Colunas: id(0), tipo(1), nota(2), comentario(3), musica_nome(4), artista(5), musica_id(6)
            feed.append({
                "id": f"rev_{r[0]}",
                "tipo": "review",
                "acao": f"avaliou a música {r[4]} ({r[5]})",
                "target_id": r[6],
                "nota": r[2],
                "comentario": r[3],
                "data_criacao": None 
            })

        listas_query = """
        SELECT 
            l.id, 'list_create' as tipo, l.nome, l.descricao
        FROM Lista l
        WHERE l.usuario_id = ?
        ORDER BY l.id DESC -- Ordem por ID (prox proxy de data)
        LIMIT 5
        """
        cur.execute(listas_query, (usuario_id,))
        listas_raw = cur.fetchall()

        for l in listas_raw:
            # Colunas: id(0), tipo(1), nome(2), descricao(3)
            feed.append({
                "id": f"list_{l[0]}",
                "tipo": "list_create",
                "acao": f"criou a nova lista '{l[2]}'",
                "target_id": l[0],
                "data_criacao": None 
            })
            
        # Não há ordenação por data, a ordem é Reviews (recentes por ID) + Listas (recentes por ID)
        
        return feed[:15]

    except sqlite3.Error as e:
        print(f"Erro no banco de dados ao buscar feed: {e}")
        return []
    finally:
        if conn:
            pass