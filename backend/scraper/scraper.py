import sys
import json
import time
import os
import platform
from concurrent.futures import ThreadPoolExecutor
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


def make_browser():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.add_experimental_option("prefs", {
        "profile.managed_default_content_settings.images": 2
    })

    if platform.system() == "Linux":
        service = Service("/usr/bin/chromedriver")
    else:
        CHROMEDRIVER_PATH = os.path.join(os.path.dirname(__file__), "chromedriver.exe")
        service = Service(CHROMEDRIVER_PATH)

    return webdriver.Chrome(service=service, options=options)


def scrape_marjane(query):
    browser = make_browser()
    produits = []
    try:
        url = f"https://marjane.ma/search/{query.replace(' ', '%20')}"
        browser.get(url)

        try:
            WebDriverWait(browser, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
            )
        except TimeoutException:
            browser.quit()
            return []

        time.sleep(2)

        cards = browser.find_elements(By.CSS_SELECTOR, ".product-card")

        for card in cards:
            try:
                img_el = card.find_element(By.CSS_SELECTOR, "img")
                titre = (img_el.get_attribute("alt") or "").strip()
            except Exception:
                texte = card.text.strip()
                titre = texte.split("\n")[0] if texte else ""

            if not titre:
                continue

            try:
                link_el = card.find_element(By.CSS_SELECTOR, "a[class*='image']")
                href = link_el.get_attribute("href") or ""
                lien = href if href.startswith("http") else "https://marjane.ma" + href
            except Exception:
                lien = ""

            try:
                price_el = card.find_element(By.CSS_SELECTOR, "[class*='price']")
                prix = price_el.text.strip().split("\n")[0]
            except Exception:
                lignes = card.text.strip().split("\n")
                prix = lignes[1] if len(lignes) > 1 else ""

            try:
                image = img_el.get_attribute("src") or ""
            except Exception:
                image = ""

            produits.append({
                "titre": titre,
                "prix": prix,
                "url": lien,
                "image": image,
                "magasin": "Marjane"
            })

    except Exception as e:
        sys.stderr.write(f"[scrape_marjane] Erreur: {e}\n")

    browser.quit()
    return produits


def scrape_aswak(query):
    browser = make_browser()
    produits = []
    try:
        q = query.replace(" ", "+")
        url = f"https://aswakassalam.com/?s={q}&post_type=product&product_cat=0"
        browser.get(url)

        try:
            WebDriverWait(browser, 12).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "li.product"))
            )
        except TimeoutException:
            browser.quit()
            return []

        cards = browser.find_elements(By.CSS_SELECTOR, "li.product")

        for card in cards:
            try:
                title_el = card.find_element(By.CSS_SELECTOR, ".woocommerce-loop-product__title")
                titre = title_el.text.strip()
            except Exception:
                titre = card.text.strip().split("\n")[0]

            if not titre or titre.lower() in ["disponible en livraison", "rupture de stock", "en stock"]:
                continue

            try:
                link_el = card.find_element(By.CSS_SELECTOR, "a[href*='/produit/']")
                lien = link_el.get_attribute("href") or ""
            except Exception:
                lien = ""

            try:
                price_el = card.find_element(By.CSS_SELECTOR, ".price")
                lignes = [l.strip() for l in price_el.text.strip().split("\n") if l.strip()]
                prix_lignes = [l for l in lignes if "dh" in l.lower()]
                prix = prix_lignes[-1] if prix_lignes else lignes[-1] if lignes else ""
                prix = prix.replace("Le prix actuel est :", "").replace("Le prix actuel était :", "").strip()
            except Exception:
                prix = ""

            try:
                img_el = card.find_element(By.CSS_SELECTOR, "img.wp-post-image")
                image = img_el.get_attribute("src") or ""
            except Exception:
                try:
                    img_el = card.find_element(By.CSS_SELECTOR, "img")
                    image = img_el.get_attribute("src") or ""
                except Exception:
                    image = ""

            if titre and lien:
                produits.append({
                    "titre": titre,
                    "prix": prix,
                    "url": lien,
                    "image": image,
                    "magasin": "Aswak Assalam"
                })

    except Exception as e:
        sys.stderr.write(f"[scrape_aswak] Erreur: {e}\n")

    browser.quit()
    return produits


def scrape_all(query):
    results = []

    with ThreadPoolExecutor(max_workers=2) as executor:
        future_marjane = executor.submit(scrape_marjane, query)
        future_aswak   = executor.submit(scrape_aswak, query)

        marjane_results = future_marjane.result()
        aswak_results   = future_aswak.result()

    results.extend(marjane_results)
    results.extend(aswak_results)

    for i, p in enumerate(results):
        p["idProduit"] = i + 1

    return results


if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "eau"
    is_alternatives = len(sys.argv) > 2 and sys.argv[2] == "--alternatives"

    try:
        produits = scrape_all(query)

        if not is_alternatives:
            mots = query.lower().split()
            produits = [
                p for p in produits
                if all(m in p["titre"].lower() for m in mots)
            ]

        print(json.dumps(produits, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))