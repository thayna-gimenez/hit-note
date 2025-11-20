import os

GENIUS_CLIENT_ID = os.getenv("GENIUS_CLIENT_ID", "")
GENIUS_CLIENT_SECRET= os.getenv("GENIUS_CLIENT_SECRET", "")
GENIUS_ACCESS_TOKEN= os.getenv("GENIUS_ACCESS_TOKEN", "")
GENIUS_API_URL = os.getenv("GENIUS_API_URL", "https://api.genius.com")

JWT_DOMAIN = os.getenv("JWT_DOMAIN", "")
JWT_CLIENT_ID = os.getenv("JWT_CLIENT_ID", "")
JWT_CLIENT_SECRET = os.getenv("JWT_CLIENT_SECRET", "")
