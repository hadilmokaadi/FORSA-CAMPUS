class CV:
    def __init__(self, id, user_id, nom_fichier=None,
                 chemin_fichier=None, date_upload=None):
        self.id = id
        self.user_id = user_id
        self.nom_fichier = nom_fichier
        self.chemin_fichier = chemin_fichier
        self.date_upload = date_upload

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "nom_fichier": self.nom_fichier,
            "chemin_fichier": self.chemin_fichier,
            "date_upload": self.date_upload.isoformat() if self.date_upload else None
        }