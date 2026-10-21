async (page) => {
  const log = [];
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(2500);

  // DOM-level click bypasses pointer interception
  const domClick = (text, opts = {}) => page.evaluate((t) => {
    const btns = [...document.querySelectorAll("button")];
    const visible = btns.filter(b => b.offsetParent !== null && b.innerText.replace(/\s+/g, " ").trim().toUpperCase().includes(t.toUpperCase()));
    const b = visible[visible.length - 1];
    if (!b) return "NOT FOUND: " + t + " (candidates: " + btns.map(x => x.innerText.replace(/\s+/g, " ").trim().slice(0, 30)).join(" | ").slice(0, 500) + ")";
    b.click();
    return "clicked: " + b.innerText.replace(/\s+/g, " ").trim().slice(0, 40);
  }, text);

  // Rules & Lore from the menu
  log.push(await domClick("Rules & Lore"));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "design/store/screen_04_rules_lore.png" });
  log.push("rules & lore captured");

  return log.join("\n");
}
