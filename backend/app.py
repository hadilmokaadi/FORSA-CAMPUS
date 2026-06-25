from flask import Flask, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from config import Config

mysql = MySQL()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.secret_key = Config.SECRET_KEY

    CORS(
        app,
        supports_credentials=True,
        origins=["http://127.0.0.1:5500"]
    )

    mysql.init_app(app)

    
    import os
    from flask import send_from_directory

    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

    @app.route("/uploads/<path:filename>")
    def uploads(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    # blueprints
    from routes.auth import auth_bp
    from routes.profile import profile_bp
    from routes.candidatures import candidatures_bp
    from routes.parcours import parcours_bp
    from routes.posts import posts_bp
   

    app.register_blueprint(auth_bp)
    app.register_blueprint(candidatures_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(parcours_bp)
    app.register_blueprint(posts_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)