async (page) => {
  const shots = [];
  const snap = () => page.locator("body").ariaSnapshot();

  // 1. Menu already captured. Start the game.
  await page.getByRole("button", { name: "PLAY ALL 20 CHAPTERS" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "design/store/screen_02_gameplay.png" });
  shots.push("gameplay captured");
  let s = await snap();
  shots.push(s.slice(0, 1800));

  // 2. Try to answer the first question: find option buttons in the snapshot
  return shots.join("\n\n---\n\n");
}
