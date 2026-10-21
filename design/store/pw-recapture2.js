async (page) => {
  const log = [];
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "design/store/screen_01_initial.png" });

  const domClick = (t) => page.evaluate((text) => {
    const btns = [...document.querySelectorAll("button")];
    const visible = btns.filter(b => b.offsetParent !== null && b.innerText.replace(/\s+/g, " ").trim().toUpperCase().includes(text.toUpperCase()));
    const b = visible[visible.length - 1];
    if (!b) return "NOT FOUND";
    b.click();
    return "ok";
  }, t);

  log.push("hs click: " + (await domClick("High Scores")));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "design/store/screen_03_high_scores.png" });
  log.push("high scores captured");

  // close overlay
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const close = btns.find(b => /close|dismiss|✕|×|back/i.test((b.getAttribute("aria-label") || "") + " " + (b.title || "")));
    if (close) close.click();
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);

  log.push("rules click: " + (await domClick("Rules & Lore")));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "design/store/screen_04_rules_lore.png" });
  log.push("rules & lore captured");
  return log.join("\n");
}
