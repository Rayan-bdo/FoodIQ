# debug_aswak.py

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import time
import os

CHROMEDRIVER_PATH = os.path.join(os.path.dirname(__file__), "chromedriver.exe")

query = "biscuit"

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
)

driver = webdriver.Chrome(service=Service(CHROMEDRIVER_PATH), options=options)

# URL correcte trouvée manuellement
url = f"https://aswakassalam.com/?s={query}&post_type=product&product_cat=0"

print(f"\n[Aswak] Fetching: {url}")
driver.get(url)

time.sleep(4)

print(f"[Aswak] Title: {driver.title}")
print(f"[Aswak] Current URL: {driver.current_url}")
print(f"[Aswak] Page source length: {len(driver.page_source)}")
print(f"[Aswak] Page source first 800 chars:\n{driver.page_source[:800]}")

# Tester les sélecteurs possibles
selectors = [
    "li.product",
    "div.product",
    "article.product",
    "ul.products li",
    ".products li",
    ".products .product",
    ".woocommerce-loop-product__title",
    "[class*='product']",
    "article"
]

print("\n[Aswak] Testing selectors on correct product search URL:")

best_selector = None

for sel in selectors:
    items = driver.find_elements(By.CSS_SELECTOR, sel)

    if items:
        print(f"  ✅ '{sel}' → {len(items)} item(s) | First: {items[0].text[:100]!r}")

        if best_selector is None:
            best_selector = sel
    else:
        print(f"  ❌ '{sel}' → 0")


# Extraire les détails des 3 premiers produits avec le meilleur sélecteur trouvé
if best_selector:
    print(f"\n[Aswak] Extracting first 3 products using selector: {best_selector}")

    products = driver.find_elements(By.CSS_SELECTOR, best_selector)

    for i, product in enumerate(products[:3]):
        print(f"\n--- Product {i + 1} ---")
        print(f"Full text:\n{product.text}")
        print(f"Inner HTML first 500 chars:\n{product.get_attribute('innerHTML')[:500]}")
else:
    print("\n[Aswak] ⚠️ Aucun produit trouvé avec les sélecteurs testés.")


# Sauvegarder le HTML complet pour inspection
with open("aswak_debug.html", "w", encoding="utf-8") as f:
    f.write(driver.page_source)

print("\n[Aswak] ✅ Full HTML saved to aswak_debug.html")

driver.quit()