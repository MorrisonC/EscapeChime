async (page) => {
  const log = [];
  // The puzzle: fearless → intrepid (option 3)
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(x => /3\.\s*intrepid/i.test(x.innerText));
    if (b) { b.click(); return "clicked intrepid"; }
    return "not found";
  });
  log.push(clicked);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "design/store/screen_02_gameplay.png" });
  log.push("gameplay (answer state) captured");

  const state = await page.evaluate(() => ({
    text: (document.body.innerText || "").slice(0, 250),
  }));
  log.push("state: " + JSON.stringify(state));
  return log.join("\n");
}
