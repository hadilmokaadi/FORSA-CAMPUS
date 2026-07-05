class Parcours:
    def __init__(self, id, user_id, universite=None, etablissement=None,
                 specialite=None, date_entree=None, date_sortie=None):
        self.id = id
        self.user_id = user_id
        self.universite = universite
        self.etablissement = etablissement
        self.specialite = specialite
        self.date_entree = date_entree
        self.date_sortie = date_sortie

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "universite": self.universite,
            "etablissement": self.etablissement,
            "specialite": self.specialite,
            "date_entree": self.date_entree.isoformat() if self.date_entree else None,
            "date_sortie": self.date_sortie.isoformat() if self.date_sortie else None
        }