import sys
import json
import time
from concurrent.futures import ThreadPoolExecutor
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

CHROMEDRIVER_PATH = r"C:\Users\A\Desktop\FoodIQ\backend\scraper\chromedriver.exe"


def make_browser():
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    # Don't actually load/render images - we only need the image URLs from the HTML
    options.add_experimental_option("prefs", {
        "profile.managed_default_content_settings.images": 2
    })
    service = Service(CHROMEDRIVER_PATH)
    return webdriver.Chrome(service=service, options=options)


def scrape_marjane(query):
    browser = make_browser()
    produits = []
    try:
        browser.get("https://www.marjane.ma/courses-en-ligne")
        time.sleep(4)

        inputs = browser.find_elements(By.TAG_NAME, "input")
        search_input = inputs[1] if len(inputs) > 1 else inputs[0]

        browser.execute_script("arguments[0].click();", search_input)
        time.sleep(0.3)
        search_input.send_keys(query)
        time.sleep(0.3)
        search_input.send_keys(Keys.RETURN)

        try:
            WebDriverWait(browser, 12).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "h2[class*='title']"))
            )
        except TimeoutException:
            browser.quit()
            return []

        titles = browser.find_elements(By.CSS_SELECTOR, "h2[class*='title']")
        links  = browser.find_elements(By.CSS_SELECTOR, "a[class*='image'][href]")
        prices = browser.find_elements(By.CSS_SELECTOR, "span[class*='price']")
        images = browser.find_elements(By.CSS_SELECTOR, "a[class*='image'] img")

        for i in range(min(len(titles), len(links))):
            titre = titles[i].text.strip()
            href  = links[i].get_attribute("href") or ""
            lien  = href if href.startswith("http") else "https://www.marjane.ma" + href
            prix  = prices[i].text.strip() if i < len(prices) else ""
            image = images[i].get_attribute("src") if i < len(images) else ""

            if titre:
                produits.append({
                    "titre": titre,
                    "prix": prix,
                    "url": lien,
                    "image": image,
                    "magasin": "Marjane"
                })

    except Exception:
        pass

    browser.quit()
    return produits


def scrape_aswak(query):
    browser = make_browser()
    produits = []
    try:
        browser.get("https://aswakassalam.com/")

        search_input = WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='s']"))
        )
        browser.execute_script("arguments[0].click();", search_input)
        search_input.send_keys(query)
        search_input.send_keys(Keys.RETURN)

        try:
            WebDriverWait(browser, 12).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "li.product, div.product"))
            )
        except TimeoutException:
            browser.quit()
            return []

        cards = browser.find_elements(By.CSS_SELECTOR, "li.product, div.product")

        for card in cards:
            try:
                title_el = card.find_element(By.CSS_SELECTOR, ".woocommerce-loop-product__title")
                titre = title_el.text.strip()
            except Exception:
                try:
                    title_el = card.find_element(By.CSS_SELECTOR, "h3")
                    titre = title_el.text.strip()
                except Exception:
                    titre = ""

            if titre.lower() in ["disponible en livraison", "rupture de stock", "en stock"]:
                continue

            try:
                link_el = card.find_element(By.CSS_SELECTOR, "a[href*='/produit/']")
                lien = link_el.get_attribute("href") or ""
            except Exception:
                lien = ""

            try:
                price_el = card.find_element(By.CSS_SELECTOR, ".price")
                raw_prix = price_el.text.strip().split("\n")[-1]
                prix = raw_prix.replace("Le prix actuel était :", "") \
                                .replace("Le prix actuel est :", "") \
                                .replace(".", "") \
                                .strip()
            except Exception:
                prix = ""

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

    except Exception:
        pass

    browser.quit()
    return produits


def scrape_all(query):
    results = []

    # Run both store scrapers AT THE SAME TIME instead of one after another
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_marjane = executor.submit(scrape_marjane, query)
        future_aswak = executor.submit(scrape_aswak, query)

        marjane_results = future_marjane.result()
        aswak_results = future_aswak.result()

    results.extend(marjane_results)
    results.extend(aswak_results)

    for i, p in enumerate(results):
        p["idProduit"] = i + 1

    return results


if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "eau"
    try:
        produits = scrape_all(query)
        print(json.dumps(produits, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
