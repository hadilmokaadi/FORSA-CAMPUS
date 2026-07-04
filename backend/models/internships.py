class Internship:
    def __init__(
        self,
        id,
        company_id,
        title,
        description,
        location=None,
        duration=None,
        created_at=None
    ):
        self.id = id
        self.company_id = company_id
        self.title = title
        self.description = description
        self.location = location
        self.duration = duration
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "duration": self.duration,
            "created_at": self.created_at
        }