class StudentProfile:
    def __init__(
        self,
        id,
        user_id,
        photo=None,
        university=None,
        degree=None,
        field_of_study=None,
        graduation_year=None,
        bio=None,
        cv_path=None,
        phone=None
    ):
        self.id = id
        self.user_id = user_id
        self.photo = photo
        self.university = university
        self.degree = degree
        self.field_of_study = field_of_study
        self.graduation_year = graduation_year
        self.bio = bio
        self.cv_path = cv_path
        self.phone = phone

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "photo": self.photo,
            "university": self.university,
            "degree": self.degree,
            "field_of_study": self.field_of_study,
            "graduation_year": self.graduation_year,
            "bio": self.bio,
            "cv_path": self.cv_path,
            "phone": self.phone
        }