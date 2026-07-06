class PostComment:
    def __init__(self, id, post_id, user_id, content, created_at=None):
        self.id = id
        self.post_id = post_id
        self.user_id = user_id
        self.content = content
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id, "post_id": self.post_id, "user_id": self.user_id,
            "content": self.content, "created_at": str(self.created_at)
        }