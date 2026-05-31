# -*- coding: utf-8 -*-
import httpx
from bs4 import BeautifulSoup
from models.job_listing import JobListing
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KariyerScraper:
    BASE_URL = "https://www.kariyer.net"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    def __init__(self, keyword: str = "backend developer"):
        self.keyword = keyword

    def scrape(self) -> List[JobListing]:
        
        logger.info(f"'{self.keyword}' icin ilanlar araniyor...")

        mock_listings = [
            JobListing(
                company_name="Accenture Turkey",
                position="Senior Backend Developer",
                location="Istanbul (Hybrid)",
                job_url="https://kariyer.net/ilan/accenture-backend-dev",
                salary_min=50000,
                salary_max=80000
            ),
            JobListing(
                company_name="Trendyol",
                position="Backend Engineer",
                location="Istanbul",
                job_url="https://kariyer.net/ilan/trendyol-backend",
                salary_min=60000,
                salary_max=100000
            ),
            JobListing(
                company_name="Getir",
                position=".NET Developer",
                location="Istanbul (Remote)",
                job_url="https://kariyer.net/ilan/getir-dotnet",
                salary_min=45000,
                salary_max=75000
            ),
        ]

        logger.info(f"{len(mock_listings)} ilan bulundu.")
        return mock_listings

    def _parse_salary(self, salary_text: str):
        
        try:
            cleaned = salary_text.replace("TL", "").replace(".", "").strip()
            parts = cleaned.split("-")
            if len(parts) == 2:
                return float(parts[0].strip()), float(parts[1].strip())
        except:
            pass
        return None, None