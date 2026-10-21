async (page) => {
  const log = [];

  // High Scores overlay
  await page.getByRole("button", { name: "High Scores & Records" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "design/store/screen_03_high_scores.png" });
  log.push("high scores captured");
  const hs = await page.locator("body").ariaSnapshot();
  log.push("overlay state:\n" + hs.slice(0, 1600));

  // close overlay: try X / Escape
  const x = page.getByRole("button", { name: "Close" });
  if (await x.count()) { await x.first().click(); } else { await page.keyboard.press("Escape"); }
  await page.waitForTimeout(1000);
  const afterClose = await page.locator("body").ariaSnapshot();
  log.push("after close:\n" + afterClose.slice(0, 300));
  return log.join("\n");
}
