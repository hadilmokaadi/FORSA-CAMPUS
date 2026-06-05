from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from app import mysql

auth_bp = Blueprint("auth", __name__)


# REGISTER
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    cur = mysql.connection.cursor()

    cur.execute("""
        INSERT INTO users (nom, prenom, email, password, role)
        VALUES (%s,%s,%s,%s,%s)
    """, (
        data["nom"],
        data["prenom"],
        data["email"],
        generate_password_hash(data["password"]),
        data["role"]
    ))

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "User created"})


# LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (data["email"],))
    user = cur.fetchone()
    cur.close()

    if user and check_password_hash(user[4], data["password"]):

        # 🔥 SESSION SET
        session["user_id"] = user[0]
        session["role"] = user[5]

        return jsonify({
            "message": "Login success",
            "name": user[1],
            "role": user[5]
        })

    return jsonify({"message": "Invalid credentials"}), 401


# LOGOUT
@auth_bp.route("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})