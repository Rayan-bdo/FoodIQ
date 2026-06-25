from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

query = "biscuit"

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

driver = webdriver.Chrome(options=options)

url = f"https://marjane.ma/search/{query}"
print(f"\n[Marjane] Fetching: {url}")
driver.get(url)

# Attendre que le JS charge
time.sleep(6)

print(f"[Marjane] Page title: {driver.title}")
print(f"[Marjane] Page source (1000 chars):\n{driver.page_source[:1000]}")
print(f"\n[Marjane] Total page source length: {len(driver.page_source)}")

# Tester plusieurs sélecteurs pour trouver les produits
selectors = [
    ".product-item",
    ".product-card",
    ".item",
    "[data-product]",
    ".products-grid li",
    ".product",
    "article",
    "[class*='product']",
    "[class*='card']",
    "[class*='item']",
    "li",
    "a[href*='/p/']",
    "[class*='Product']",
    "[class*='Card']"
]

print("\n[Marjane] Testing selectors:")

for sel in selectors:
    items = driver.find_elements(By.CSS_SELECTOR, sel)

    if items:
        print(f"  ✅ '{sel}' → {len(items)} items | First: {items[0].text[:80]!r}")
    else:
        print(f"  ❌ '{sel}' → 0")


# Extraire les détails des 3 premières cartes produits
print("\n[Marjane] Extracting product details from first 3 cards:")

cards = driver.find_elements(By.CSS_SELECTOR, ".product-card")

for i, card in enumerate(cards[:3]):
    print(f"\n--- Card {i + 1} ---")
    print(f"Full text:\n{card.text}")
    print(f"Inner HTML (500 chars):\n{card.get_attribute('innerHTML')[:500]}")


# Sauvegarder le HTML complet pour inspection
with open("marjane_debug.html", "w", encoding="utf-8") as f:
    f.write(driver.page_source)

print("\n[Marjane] ✅ Full HTML saved to marjane_debug.html")

driver.quit()