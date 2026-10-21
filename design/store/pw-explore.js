async (page) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "design/store/screen_01_initial.png" });
  const snap = await page.locator("body").ariaSnapshot();
  return snap.slice(0, 3000);
}
