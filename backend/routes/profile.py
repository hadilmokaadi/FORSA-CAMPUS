from flask import Blueprint, request, jsonify, session
from app import mysql
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint("profile", __name__)

UPLOAD_FOLDER = "uploads"
PHOTO_FOLDER = os.path.join(UPLOAD_FOLDER, "photos")
LOGO_FOLDER = os.path.join(UPLOAD_FOLDER, "logos")

os.makedirs(PHOTO_FOLDER, exist_ok=True)
os.makedirs(LOGO_FOLDER, exist_ok=True)

ALLOWED_CV_EXT = {"pdf", "doc", "docx"}


def allowed_cv(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_CV_EXT


# =========================
# GET LOGGED USER PROFILE (SESSION)
# =========================
@profile_bp.route("/profile", methods=["GET"])
def get_profile():

    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = session["user_id"]
    cur = mysql.connection.cursor()

    cur.execute("SELECT id, nom, prenom, email, role FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()

    if not user:
        return jsonify({"message": "User not found"}), 404

    result = {
        "id": user[0],
        "nom": user[1],
        "prenom": user[2],
        "email": user[3],
        "role": user[4]
    }

    role = user[4]

    if role == "etudiant":
        cur.execute("""
            SELECT university, degree, field_of_study,
                   graduation_year, phone, bio, photo, cv
            FROM student_profiles
            WHERE user_id=%s
        """, (user_id,))
        p = cur.fetchone()

        if p:
            result.update({
                "university": p[0],
                "degree": p[1],
                "field_of_study": p[2],
                "graduation_year": p[3],
                "phone": p[4],
                "bio": p[5],
                "photo": p[6],
                "cv": p[7]
            })

    else:
        cur.execute("""
            SELECT company_name, sector, website,
                   phone, address, description, logo
            FROM enterprise_profiles
            WHERE user_id=%s
        """, (user_id,))
        p = cur.fetchone()

        if p:
            result.update({
                "company_name": p[0],
                "sector": p[1],
                "website": p[2],
                "phone": p[3],
                "address": p[4],
                "description": p[5],
                "logo": p[6]
            })

    cur.close()
    return jsonify(result)


# =========================
# UPDATE PROFILE (SESSION)
# =========================
@profile_bp.route("/profile", methods=["PUT"])
def update_profile():

    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = session["user_id"]
    cur = mysql.connection.cursor()

    cur.execute("SELECT role FROM users WHERE id=%s", (user_id,))
    role = cur.fetchone()[0]

    # -------- STUDENT --------
    if role == "etudiant":

        university = request.form.get("university")
        degree = request.form.get("degree")
        field = request.form.get("field_of_study")
        year = request.form.get("graduation_year")
        phone = request.form.get("phone")
        bio = request.form.get("bio")

        photo = request.files.get("photo")
        photo_path = None

        if photo:
            filename = secure_filename(photo.filename)
            photo.save(os.path.join("uploads", "photos", filename))
            photo_path = f"uploads/photos/{filename}"

        cur.execute("SELECT id FROM student_profiles WHERE user_id=%s", (user_id,))
        exists = cur.fetchone()

        if exists:
            cur.execute("""
                UPDATE student_profiles
                SET university=COALESCE(%s, university),
                    degree=COALESCE(%s, degree),
                    field_of_study=COALESCE(%s, field_of_study),
                    graduation_year=COALESCE(%s, graduation_year),
                    phone=COALESCE(%s, phone),
                    bio=COALESCE(%s, bio),
                    photo=COALESCE(%s, photo)
                WHERE user_id=%s
            """, (university, degree, field, year, phone, bio, photo_path, user_id))
        else:
            cur.execute("""
                INSERT INTO student_profiles
                (user_id, university, degree, field_of_study, graduation_year, phone, bio, photo)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (user_id, university, degree, field, year, phone, bio, photo_path))

    # -------- COMPANY --------
    else:

        company_name = request.form.get("company_name")
        sector = request.form.get("sector")
        website = request.form.get("website")
        phone = request.form.get("phone")
        address = request.form.get("address")
        description = request.form.get("description")

        logo = request.files.get("logo")
        logo_path = None

        if logo:
            filename = secure_filename(logo.filename)
            logo_path = os.path.join("uploads/logos", filename)
            logo.save(logo_path)

        cur.execute("SELECT id FROM enterprise_profiles WHERE user_id=%s", (user_id,))
        exists = cur.fetchone()

        if exists:
            cur.execute("""
                UPDATE enterprise_profiles
                SET company_name=%s, sector=%s, website=%s,
                    phone=%s, address=%s, description=%s,
                    logo=COALESCE(%s, logo)
                WHERE user_id=%s
            """, (company_name, sector, website, phone, address, description, logo_path, user_id))
        else:
            cur.execute("""
                INSERT INTO enterprise_profiles
                (user_id, company_name, sector, website, phone, address, description, logo)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (user_id, company_name, sector, website, phone, address, description, logo_path))

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Profile updated"})


# =========================
# UPLOAD / REPLACE CV (STUDENT PROFILE)
# =========================
@profile_bp.route("/profile/cv", methods=["POST"])
def upload_profile_cv():

    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = session["user_id"]

    if "cv" not in request.files:
        return jsonify({"message": "Aucun fichier"}), 400

    file = request.files["cv"]

    if file.filename == "":
        return jsonify({"message": "Fichier vide"}), 400

    if not allowed_cv(file.filename):
        return jsonify({"message": "Format non autorisé (pdf, doc, docx uniquement)"}), 400

    filename = secure_filename(file.filename)
    cv_filename = f"cv_{user_id}_{filename}"
    file.save(os.path.join(UPLOAD_FOLDER, cv_filename))

    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM student_profiles WHERE user_id=%s", (user_id,))
    exists = cur.fetchone()

    if exists:
        cur.execute("UPDATE student_profiles SET cv=%s WHERE user_id=%s", (cv_filename, user_id))
    else:
        cur.execute(
            "INSERT INTO student_profiles (user_id, cv) VALUES (%s, %s)",
            (user_id, cv_filename)
        )

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "CV mis à jour", "cv": cv_filename}), 200


# =========================
# VIEW OTHER PROFILE (PUBLIC)
# =========================
@profile_bp.route("/profile/<int:user_id>", methods=["GET"])
def view_profile(user_id):

    cur = mysql.connection.cursor()

    cur.execute("SELECT id, nom, prenom, email, role FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()

    if not user:
        return jsonify({"message": "User not found"}), 404

    result = {
        "id": user[0],
        "nom": user[1],
        "prenom": user[2],
        "email": user[3],
        "role": user[4]
    }

    role = user[4]

    if role == "etudiant":
        cur.execute("""
            SELECT university, degree, field_of_study,
                   graduation_year, phone, bio, photo, cv
            FROM student_profiles
            WHERE user_id=%s
        """, (user_id,))
        p = cur.fetchone()

        if p:
            result.update({
                "university": p[0],
                "degree": p[1],
                "field_of_study": p[2],
                "graduation_year": p[3],
                "phone": p[4],
                "bio": p[5],
                "photo": p[6],
                "cv": p[7]
            })

    else:
        cur.execute("""
            SELECT company_name, sector, website,
                   phone, address, description, logo
            FROM enterprise_profiles
            WHERE user_id=%s
        """, (user_id,))
        p = cur.fetchone()

        if p:
            result.update({
                "company_name": p[0],
                "sector": p[1],
                "website": p[2],
                "phone": p[3],
                "address": p[4],
                "description": p[5],
                "logo": p[6]
            })

    cur.close()
    return jsonify(result)


# =========================
# SEARCH
# =========================
@profile_bp.route("/api/search", methods=["GET"])
def search():

    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([])

    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT id, nom, prenom, role
        FROM users
        WHERE nom LIKE %s OR prenom LIKE %s
        LIMIT 10
    """, (f"%{q}%", f"%{q}%"))

    users = cur.fetchall()

    results = [{
        "id": u[0],
        "name": f"{u[1]} {u[2]}",
        "type": u[3]
    } for u in users]

    cur.close()
    return jsonify(results)