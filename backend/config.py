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


    # 📧 MAIL CONFIG
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True

    MAIL_USERNAME = "hadil.mokaadi@sesame.com.tn"
    MAIL_PASSWORD = "mwhsxdxfceopnaep"
    MAIL_DEFAULT_SENDER = "hadil.mokaadi@sesame.com.tn"