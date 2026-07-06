class Post:
    def __init__(self, id, user_id, content=None, image=None, created_at=None):
        self.id = id
        self.user_id = user_id
        self.content = content
        self.image = image
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id, "user_id": self.user_id, "content": self.content,
            "image": self.image, "created_at": str(self.created_at)
        }