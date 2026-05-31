# -*- coding: utf-8 -*-
import os
import httpx
import schedule
import time
import logging
from dotenv import load_dotenv
from scrapers.kariyer_scraper import KariyerScraper

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

API_BASE_URL = os.getenv("API_BASE_URL")
API_EMAIL = os.getenv("API_EMAIL")
API_PASSWORD = os.getenv("API_PASSWORD")
INTERVAL = int(os.getenv("SCRAPE_INTERVAL_MINUTES", "60"))


def get_token() -> str | None:
    
    try:
        response = httpx.post(
            f"{API_BASE_URL}/api/auth/login",
            json={"email": API_EMAIL, "password": API_PASSWORD},
            verify=False  
        )
        if response.status_code == 200:
            token = response.json()["token"]
            logger.info("API token alindi")
            return token
        else:
            logger.error(f"Login basarisiz: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"API baglanti hatasi: {e}")
        return None


def push_listing(token: str, listing) -> bool:
    try:
        response = httpx.post(
            f"{API_BASE_URL}/api/jobapplications",
            json=listing.to_dict(),
            headers={"Authorization": f"Bearer {token}"},
            verify=False
        )
        if response.status_code == 201:
            logger.info(f"Ilan eklendi: {listing.company_name} - {listing.position}")
            return True
        else:
            logger.warning(f"Ilan eklenemedi: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Push hatasi: {e}")
        return False


def run_scraper():
    logger.info("Scraper baslatildi...")

    token = get_token()
    if not token:
        logger.error("Token alinamadi, scraper durduruluyor.")
        return

    scraper = KariyerScraper(keyword="backend developer")
    listings = scraper.scrape()

    success_count = 0
    for listing in listings:
        if push_listing(token, listing):
            success_count += 1

    logger.info(f"Tamamlandi: {success_count}/{len(listings)} ilan eklendi.")


def main():
    logger.info(f"JobTrackr Scraper basladi. Her {INTERVAL} dakikada calisacak.")

   
    run_scraper()


    schedule.every(INTERVAL).minutes.do(run_scraper)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()