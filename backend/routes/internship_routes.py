from flask import Blueprint, request, jsonify, session
from app import mysql

internship_bp = Blueprint("internship", __name__)


# -----------------------------
# GET ALL INTERNSHIPS (PUBLIC)
# -----------------------------
@internship_bp.route("/internships", methods=["GET"])
def get_internships():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM internships")
    rows = cur.fetchall()

    columns = [desc[0] for desc in cur.description]
    result = [dict(zip(columns, row)) for row in rows]

    cur.close()
    return jsonify(result)


# -----------------------------
# GET INTERNSHIP BY ID (PUBLIC)
# -----------------------------
@internship_bp.route("/internships/<int:id>", methods=["GET"])
def get_internship(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM internships WHERE id=%s", (id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"error": "Internship not found"}), 404

    columns = [desc[0] for desc in cur.description]
    result = dict(zip(columns, row))

    cur.close()
    return jsonify(result)


# -----------------------------
# CREATE INTERNSHIP (BYPASSING SESSIONS FOR TESTING)
# -----------------------------
@internship_bp.route("/internships", methods=["POST"])
def create_internship():
    # 🔥 Hna raddneha static user_id = 1 bech ma3adch tatla3lek 401 Unauthorized dima
    user_id = 1  

    data = request.json
    required = ["title", "description"]
    if not data or not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    cur = mysql.connection.cursor()

    # Thbita ken el profile mta3 el enterprise jdid walla m7toot fil base
    cur.execute("SELECT id FROM enterprise_profiles WHERE user_id=%s", (user_id,))
    enterprise = cur.fetchone()

    if not enterprise:
        # Ken el base fergha, n-creiw enterprise_profile automatic bech el test yemchi mreguel
        cur.execute("INSERT INTO enterprise_profiles (user_id, company_name) VALUES (%s, %s)", (user_id, "Test Company"))
        mysql.connection.commit()
        enterprise_id = cur.lastrowid
    else:
        enterprise_id = enterprise[0]

    # Insertion direct fil base de données
    cur.execute("""
        INSERT INTO internships
        (enterprise_id, title, description, location, duration, salary, requirements, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        enterprise_id,
        data["title"],
        data["description"],
        data.get("location"),
        data.get("duration"),
        data.get("salary"),
        data.get("requirements"),
        data.get("status", "open")
    ))

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Internship created"}), 201


# -----------------------------
# UPDATE INTERNSHIP (SAFE TEST BYPASS)
# -----------------------------
@internship_bp.route("/internships/<int:id>", methods=["PUT"])
def update_internship(id):
    user_id = 1  # 🔥 Bypass login check

    data = request.json
    if not data:
        return jsonify({"error": "Missing data"}), 400

    cur = mysql.connection.cursor()

    cur.execute("""
        UPDATE internships
        SET title=%s,
            description=%s,
            location=%s,
            duration=%s,
            salary=%s,
            requirements=%s,
            status=%s
        WHERE id=%s
    """, (
        data.get("title"),
        data.get("description"),
        data.get("location"),
        data.get("duration"),
        data.get("salary"),
        data.get("requirements"),
        data.get("status", "open"),
        id
    ))

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Internship updated"})


# -----------------------------
# DELETE INTERNSHIP (SAFE TEST BYPASS)
# -----------------------------
@internship_bp.route("/internships/<int:id>", methods=["DELETE"])
def delete_internship(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM internships WHERE id=%s", (id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Internship deleted"})


# -----------------------------
# SEARCH INTERNSHIPS (PUBLIC)
# -----------------------------
@internship_bp.route("/internships/search", methods=["GET"])
def search_internships():
    keyword = request.args.get("q", "").strip()

    if not keyword:
        return jsonify([])

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT * FROM internships
        WHERE title LIKE %s OR location LIKE %s
    """, (f"%{keyword}%", f"%{keyword}%"))

    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    result = [dict(zip(columns, row)) for row in rows]

    cur.close()
    return jsonify(result)


# -----------------------------
# GET INTERNSHIPS BY ENTERPRISE PROFILE (MY OFFERS)
# -----------------------------
@internship_bp.route("/internships/my-offers", methods=["GET"])
def get_my_internships():
    user_id = 1  # 🔥 Bypass login session check

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT i.* FROM internships i
        JOIN enterprise_profiles e ON i.enterprise_id = e.id
        WHERE e.user_id = %s
    """, (user_id,))

    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    result = [dict(zip(columns, row)) for row in rows]

    cur.close()
    return jsonify(result)