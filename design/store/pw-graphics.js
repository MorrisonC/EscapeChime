async (page) => {
  const log = [];
  await page.setViewportSize({ width: 512, height: 512 });
  await page.goto("file:///C:/Development/EscapeChime/design/store/icon.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "design/store/icon_512.png" });
  log.push("icon captured");

  await page.setViewportSize({ width: 1024, height: 500 });
  await page.goto("file:///C:/Development/EscapeChime/design/store/feature-graphic.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "design/store/feature_graphic_1024x500.png" });
  log.push("feature graphic captured");
  return log.join("\n");
}
