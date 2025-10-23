import os
import sqlite3 as lite

DB_PATH = os.path.join(os.path.dirname(__file__), "bd_hitnote.db")

def get_connection():
    # Uma conexão nova por chamada; segura entre threads
    return lite.connect(DB_PATH, check_same_thread=False)
