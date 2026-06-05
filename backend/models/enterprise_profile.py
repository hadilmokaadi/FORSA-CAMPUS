class EnterpriseProfile:
    def __init__(
        self,
        id,
        user_id,
        logo=None,
        company_name=None,
        sector=None,
        website=None,
        description=None,
        phone=None,
        address=None
    ):
        self.id = id
        self.user_id = user_id
        self.logo = logo
        self.company_name = company_name
        self.sector = sector
        self.website = website
        self.description = description
        self.phone = phone
        self.address = address

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "logo": self.logo,
            "company_name": self.company_name,
            "sector": self.sector,
            "website": self.website,
            "description": self.description,
            "phone": self.phone,
            "address": self.address
        }