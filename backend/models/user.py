class User:
    def __init__(
        self,
        id,
        nom,
        prenom,
        email,
        role,
        created_at=None
    ):
        self.id = id
        self.nom = nom
        self.prenom = prenom
        self.email = email
        self.role = role
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "prenom": self.prenom,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at
        }