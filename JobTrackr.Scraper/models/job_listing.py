from dataclasses import dataclass
from typing import Optional

@dataclass
class JobListing:
    company_name: str
    position: str
    location: str
    job_url: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None

    def to_dict(self):
        return {
            "companyName": self.company_name,
            "position": self.position,
            "location": self.location,
            "jobUrl": self.job_url,
            "salaryMin": self.salary_min,
            "salaryMax": self.salary_max
        }