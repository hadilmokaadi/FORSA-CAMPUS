class Application:
    def __init__(
        self,
        id,
        internship_id,
        student_id,
        status="pending",
        applied_at=None
    ):
        self.id = id
        self.internship_id = internship_id
        self.student_id = student_id
        self.status = status
        self.applied_at = applied_at

    def to_dict(self):
        return {
            "id": self.id,
            "internship_id": self.internship_id,
            "student_id": self.student_id,
            "status": self.status,
            "applied_at": self.applied_at
        }