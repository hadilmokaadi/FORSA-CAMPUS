from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from app import mysql

from datetime import datetime, timedelta
import secrets
from flask_mail import Message
from app import mail

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

# FORGOT PASSWORD
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.json
    email = data["email"]

    cur = mysql.connection.cursor()

    cur.execute(
        "SELECT * FROM users WHERE email=%s",
        (email,)
    )

    user = cur.fetchone()

    if not user:
        cur.close()
        return jsonify({
            "message": "Email not found"
        }), 404


    # Generate token
    token = secrets.token_urlsafe(32)

    expiry = datetime.now() + timedelta(minutes=15)


    cur.execute("""
        UPDATE users
        SET reset_token=%s,
            reset_token_expiry=%s
        WHERE email=%s
    """,
    (
        token,
        expiry,
        email
    ))

    mysql.connection.commit()
    cur.close()


    reset_link = f"http://127.0.0.1:5500/frontend/reset-password.html?token={token}"


    msg = Message(
        "Password Reset",
        recipients=[email]
    )

    msg.body = f"""
    Hello {user[1]},

    Click this link to reset your password:

    {reset_link}

    This link expires in 15 minutes.
    """

    mail.send(msg)


    return jsonify({
        "message": "Reset email sent"
    })

# RESET PASSWORD
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.json

    token = data["token"]
    new_password = data["password"]


    cur = mysql.connection.cursor()


    cur.execute("""
        SELECT * FROM users 
        WHERE reset_token=%s
    """,
    (token,))


    user = cur.fetchone()


    if not user:
        cur.close()
        return jsonify({
            "message": "Invalid token"
        }), 400



    # reset_token_expiry is column 8
    expiry = datetime.strptime(
        str(user[8]),
        "%Y-%m-%d %H:%M:%S"
    )


    if expiry < datetime.now():

        cur.close()

        return jsonify({
            "message": "Token expired"
        }), 400



    cur.execute("""
        UPDATE users
        SET password=%s,
            reset_token=NULL,
            reset_token_expiry=NULL
        WHERE id=%s
    """,
    (
        generate_password_hash(new_password),
        user[0]
    ))


    mysql.connection.commit()

    cur.close()


    return jsonify({
        "message": "Password updated"
    })