
class Config:
    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = ""
    MYSQL_DB = "forsa_campus"

    # 🔐 Flask session key 
    SECRET_KEY = "dev_secret_key_change_this"

    # 🍪 SESSION CONFIG 
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False  
    SESSION_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = 3600  