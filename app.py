from flask import Flask
from flask_mysqldb import MySQL
from flask_cors import CORS
from config import Config

mysql = MySQL()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.secret_key = Config.SECRET_KEY

    mysql.init_app(app)
    CORS(app)

    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)