from flask import Blueprint, request, jsonify, session
from app import mysql
from werkzeug.utils import secure_filename
import os

candidatures_bp = Blueprint('candidatures', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@candidatures_bp.route('/upload-cv', methods=['POST'])
def upload_cv():
    if 'cv' not in request.files:
        return jsonify({"message": "Aucun fichier"}), 400
    
    file = request.files['cv']
    
    if file.filename == '':
        return jsonify({"message": "Fichier vide"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({"message": "CV uploadé", "filename": filename}), 200
    
    return jsonify({"message": "Format non autorisé"}), 400

@candidatures_bp.route('/apply', methods=['POST'])
def apply():
    data = request.get_json()
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"message": "Non connecté"}), 401
    
    offre_id = data.get('offre_id')
    cv = data.get('cv', '')
    
    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO applications (user_id, offre_id, cv)
        VALUES (%s, %s, %s)
    """, (user_id, offre_id, cv))
    mysql.connection.commit()
    cur.close()
    
    return jsonify({"message": "Candidature envoyée"}), 201

@candidatures_bp.route('/mes-candidatures', methods=['GET'])
def mes_candidatures():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"message": "Non connecté"}), 401
    
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM applications WHERE user_id = %s", (user_id,))
    candidatures = cur.fetchall()
    cur.close()
    
    return jsonify(candidatures), 200
    