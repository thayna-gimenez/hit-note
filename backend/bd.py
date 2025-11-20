import os
import sqlite3 as lite

DB_PATH = "bd_hitnote.db"

def get_connection():
    # Uma conexão nova por chamada; segura entre threads
    return lite.connect(DB_PATH, check_same_thread=False)
