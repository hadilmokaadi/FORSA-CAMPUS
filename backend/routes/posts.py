from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
from app import mysql
import os
import time

posts_bp = Blueprint('posts', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_IMAGE_EXT = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_REACTIONS = {'like', 'love', 'support'}


def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXT


# GET all posts (feed), most recent first
@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT p.id, p.content, p.image, p.created_at,
               u.nom, u.prenom, u.role, p.user_id,
               (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) AS comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    """)
    rows = cur.fetchall()

    posts = []
    for row in rows:
        post_id = row[0]

        cur.execute("""
            SELECT reaction_type, COUNT(*) FROM post_likes
            WHERE post_id = %s GROUP BY reaction_type
        """, (post_id,))
        reactions = {r[0]: r[1] for r in cur.fetchall()}

        cur.execute("""
            SELECT reaction_type FROM post_likes
            WHERE post_id = %s AND user_id = %s
        """, (post_id, user_id))
        my_row = cur.fetchone()
        my_reaction = my_row[0] if my_row else None

        posts.append({
            "id": post_id,
            "content": row[1],
            "image": row[2],
            "created_at": row[3].isoformat() if row[3] else None,
            "nom": row[4],
            "prenom": row[5],
            "role": row[6],
            "comment_count": row[8],
            "reactions": reactions,
            "my_reaction": my_reaction,
            "is_owner": row[7] == user_id
        })

    cur.close()
    return jsonify(posts), 200


# CREATE a new post (text and/or image, multipart/form-data)
@posts_bp.route('/posts', methods=['POST'])
def create_post():
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    content = request.form.get('content', '').strip()
    image_filename = None

    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_image(file.filename):
            safe_name = secure_filename(file.filename)
            image_filename = f"post_{int(time.time())}_{safe_name}"
            file.save(os.path.join(UPLOAD_FOLDER, image_filename))

    if not content and not image_filename:
        return jsonify({"message": "Le post doit contenir du texte ou une image"}), 400

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO posts (user_id, content, image)
        VALUES (%s, %s, %s)
    """, (user_id, content, image_filename))
    mysql.connection.commit()
    new_id = cur.lastrowid
    cur.close()

    return jsonify({"message": "Post publié", "id": new_id}), 201


# UPDATE a post's text content (owner only)
@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    data = request.get_json()
    content = (data.get('content') or '').strip()

    if not content:
        return jsonify({"message": "Le post ne peut pas être vide"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT user_id FROM posts WHERE id=%s", (post_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"message": "Post introuvable"}), 404

    if row[0] != user_id:
        cur.close()
        return jsonify({"message": "Non autorisé"}), 403

    cur.execute("UPDATE posts SET content=%s WHERE id=%s", (content, post_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Post modifié"}), 200


# DELETE a post (owner only)
@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    cur = mysql.connection.cursor()
    cur.execute("SELECT user_id FROM posts WHERE id=%s", (post_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"message": "Post introuvable"}), 404

    if row[0] != user_id:
        cur.close()
        return jsonify({"message": "Non autorisé"}), 403

    cur.execute("DELETE FROM posts WHERE id=%s", (post_id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Post supprimé"}), 200


# REACT to a post (like / love / support). Same reaction again removes it.
@posts_bp.route('/posts/<int:post_id>/react', methods=['POST'])
def react_to_post(post_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    data = request.get_json()
    reaction_type = data.get('reaction_type', 'like')

    if reaction_type not in ALLOWED_REACTIONS:
        return jsonify({"message": "Type de réaction invalide"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT reaction_type FROM post_likes WHERE post_id=%s AND user_id=%s", (post_id, user_id))
    existing = cur.fetchone()

    if existing:
        if existing[0] == reaction_type:
            cur.execute("DELETE FROM post_likes WHERE post_id=%s AND user_id=%s", (post_id, user_id))
            my_reaction = None
        else:
            cur.execute(
                "UPDATE post_likes SET reaction_type=%s WHERE post_id=%s AND user_id=%s",
                (reaction_type, post_id, user_id)
            )
            my_reaction = reaction_type
    else:
        cur.execute(
            "INSERT INTO post_likes (post_id, user_id, reaction_type) VALUES (%s, %s, %s)",
            (post_id, user_id, reaction_type)
        )
        my_reaction = reaction_type

    mysql.connection.commit()

    cur.execute("""
        SELECT reaction_type, COUNT(*) FROM post_likes
        WHERE post_id=%s GROUP BY reaction_type
    """, (post_id,))
    reactions = {r[0]: r[1] for r in cur.fetchall()}
    cur.close()

    return jsonify({"my_reaction": my_reaction, "reactions": reactions}), 200


# GET comments for a post
@posts_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT c.id, c.content, c.created_at, u.nom, u.prenom, c.user_id
        FROM post_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = %s
        ORDER BY c.created_at ASC
    """, (post_id,))
    rows = cur.fetchall()
    cur.close()

    comments = []
    for row in rows:
        comments.append({
            "id": row[0],
            "content": row[1],
            "created_at": row[2].isoformat() if row[2] else None,
            "nom": row[3],
            "prenom": row[4],
            "is_owner": row[5] == user_id
        })

    return jsonify(comments), 200


# ADD a comment to a post
@posts_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    data = request.get_json()
    content = (data.get('content') or '').strip()

    if not content:
        return jsonify({"message": "Le commentaire ne peut pas être vide"}), 400

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO post_comments (post_id, user_id, content)
        VALUES (%s, %s, %s)
    """, (post_id, user_id, content))
    mysql.connection.commit()
    new_id = cur.lastrowid
    cur.close()

    return jsonify({"message": "Commentaire ajouté", "id": new_id}), 201


# UPDATE a comment (owner only)
@posts_bp.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['PUT'])
def update_comment(post_id, comment_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    data = request.get_json()
    content = (data.get('content') or '').strip()

    if not content:
        return jsonify({"message": "Le commentaire ne peut pas être vide"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT user_id FROM post_comments WHERE id=%s", (comment_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"message": "Commentaire introuvable"}), 404

    if row[0] != user_id:
        cur.close()
        return jsonify({"message": "Non autorisé"}), 403

    cur.execute("UPDATE post_comments SET content=%s WHERE id=%s", (content, comment_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Commentaire modifié"}), 200


# DELETE a comment (owner only)
@posts_bp.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(post_id, comment_id):
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Non connecté"}), 401

    cur = mysql.connection.cursor()
    cur.execute("SELECT user_id FROM post_comments WHERE id=%s", (comment_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"message": "Commentaire introuvable"}), 404

    if row[0] != user_id:
        cur.close()
        return jsonify({"message": "Non autorisé"}), 403

    cur.execute("DELETE FROM post_comments WHERE id=%s", (comment_id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Commentaire supprimé"}), 200