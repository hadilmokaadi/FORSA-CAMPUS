class PostLike:
    def __init__(self, id, post_id, user_id, reaction_type="like"):
        self.id = id
        self.post_id = post_id
        self.user_id = user_id
        self.reaction_type = reaction_type

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "user_id": self.user_id,
            "reaction_type": self.reaction_type
        }