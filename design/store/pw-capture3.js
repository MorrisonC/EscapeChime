async (page) => {
  const log = [];
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(2500);

  // Bottom nav inside the menu overlay (last match; banner copy is behind the overlay)
  await page.getByRole("button", { name: "High Scores" }).last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "design/store/screen_03_high_scores.png" });
  log.push("high scores captured");

  // Close it — find an X / close button inside the current overlay
  const closed = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const close = btns.find(b => /close|dismiss/i.test(b.getAttribute("aria-label") || b.title || ""));
    if (close) { close.click(); return "clicked: " + (close.getAttribute("aria-label") || close.title); }
    return null;
  });
  if (!closed) { await page.keyboard.press("Escape"); }
  await page.waitForTimeout(1200);
  log.push("close action: " + (closed || "Escape"));

  // Rules & Lore overlay
  await page.getByRole("button", { name: "Rules & Lore" }).last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "design/store/screen_04_rules_lore.png" });
  log.push("rules & lore captured");

  const state = await page.evaluate(() =>
    [...document.querySelectorAll("div.absolute.inset-0.bg-black\\/70 button, button")].length
  );
  log.push("buttons on page: " + state);
  return log.join("\n");
}
