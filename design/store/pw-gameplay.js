async (page) => {
  const log = [];
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(2500);

  // Start the game via DOM click
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.innerText.includes("PLAY ALL 20 CHAPTERS"));
    b && b.click();
  });
  log.push("play clicked");

  // Wait until the game canvas has meaningful painted content
  let variance = 0, waited = 0;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    waited += 500;
    variance = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c || !c.width) return 0;
      try {
        const ctx = c.getContext("2d");
        const d = ctx.getImageData(0, 0, c.width, Math.min(c.height, 200)).data;
        let sum = 0, sq = 0, n = 0;
        for (let p = 0; p < d.length; p += 400) { sum += d[p]; sq += d[p] * d[p]; n++; }
        const mean = sum / n;
        return Math.sqrt(sq / n - mean * mean).toFixed(1);
      } catch (e) { return 0; }
    });
    if (variance > 20) break;
  }
  log.push("canvas variance=" + variance + " after " + waited + "ms");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "design/store/screen_02_gameplay.png" });
  log.push("gameplay captured");

  const sz = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? c.width + "x" + c.height + " style=" + (c.style.width || "") : "no canvas";
  });
  log.push("canvas: " + sz);
  return log.join("\n");
}
