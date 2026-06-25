from flask import Blueprint, request, jsonify, session
from app import mysql

parcours_bp = Blueprint('parcours', __name__)


# GET all parcours entries for the logged-in student
@parcours_bp.route('/mes-parcours', methods=['GET'])
def mes_parcours():
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT id, universite, etablissement, specialite, date_entree, date_sortie
        FROM parcours_universitaire
        WHERE user_id = %s
        ORDER BY date_entree DESC
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()

    parcours = []
    for row in rows:
        parcours.append({
            "id": row[0],
            "universite": row[1],
            "etablissement": row[2],
            "specialite": row[3],
            "date_entree": row[4].isoformat() if row[4] else None,
            "date_sortie": row[5].isoformat() if row[5] else None
        })

    return jsonify(parcours), 200


# ADD a new parcours entry
@parcours_bp.route('/parcours', methods=['POST'])
def add_parcours():
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    data = request.get_json()

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO parcours_universitaire
        (user_id, universite, etablissement, specialite, date_entree, date_sortie)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        user_id,
        data.get("universite"),
        data.get("etablissement"),
        data.get("specialite"),
        data.get("date_entree") or None,
        data.get("date_sortie") or None
    ))
    mysql.connection.commit()
    new_id = cur.lastrowid
    cur.close()

    return jsonify({"message": "Parcours ajouté", "id": new_id}), 201


# UPDATE an existing parcours entry
@parcours_bp.route('/parcours/<int:parcours_id>', methods=['PUT'])
def update_parcours(parcours_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    data = request.get_json()

    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE parcours_universitaire
        SET universite=%s, etablissement=%s, specialite=%s, date_entree=%s, date_sortie=%s
        WHERE id=%s AND user_id=%s
    """, (
        data.get("universite"),
        data.get("etablissement"),
        data.get("specialite"),
        data.get("date_entree") or None,
        data.get("date_sortie") or None,
        parcours_id,
        user_id
    ))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Parcours mis à jour"}), 200


# DELETE a parcours entry
@parcours_bp.route('/parcours/<int:parcours_id>', methods=['DELETE'])
def delete_parcours(parcours_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    cur = mysql.connection.cursor()
    cur.execute("""
        DELETE FROM parcours_universitaire
        WHERE id=%s AND user_id=%s
    """, (parcours_id, user_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Parcours supprimé"}), 200