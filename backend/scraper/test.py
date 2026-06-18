from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

service = Service(r"C:\Users\A\Desktop\FoodIQ\backend\scraper\chromedriver.exe")
options = webdriver.ChromeOptions()

browser = webdriver.Chrome(service=service, options=options)
browser.get("https://www.marjane.ma/courses-en-ligne")
time.sleep(5)

inputs = browser.find_elements(By.TAG_NAME, "input")
search_input = inputs[1]
browser.execute_script("arguments[0].click();", search_input)
time.sleep(0.5)
search_input.send_keys("sidi ali")
time.sleep(1)
search_input.send_keys(Keys.RETURN)  # press Enter
time.sleep(5)

print("URL:", browser.current_url)

titles = browser.find_elements(By.CSS_SELECTOR, "h2[class*='title']")
print("Products found:", len(titles))
for t in titles[:3]:
    print("-", t.text)

browser.quit()