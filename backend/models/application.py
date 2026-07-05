class Application:
    def __init__(self, id, user_id, offre_id=None, cv=None,
                 status="en attente", created_at=None):
        self.id = id
        self.user_id = user_id
        self.offre_id = offre_id
        self.cv = cv
        self.status = status
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "offre_id": self.offre_id,
            "cv": self.cv,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }