async (page) => {
  const log = [];
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(3000);

  // Menu screenshot with loaded art
  await page.screenshot({ path: "design/store/screen_01_initial.png" });
  log.push("menu captured");

  // Asset sanity check via fetch
  const assetOk = await page.evaluate(async () => {
    const r = await fetch("assets/images/tape_spool_assembly.png");
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf.slice(0, 4));
    return { status: r.status, type: r.headers.get("content-type"), len: buf.byteLength, magic: String.fromCharCode(...bytes) };
  });
  log.push("asset fetch: " + JSON.stringify(assetOk));

  // Start game
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.innerText.includes("PLAY ALL 20 CHAPTERS"));
    b && b.click();
  });
  await page.waitForTimeout(4000);

  const alive = await page.evaluate(() => ({
    rootChildren: document.getElementById("root")?.childElementCount ?? -1,
    bodyText: (document.body.innerText || "").slice(0, 200),
    canvases: document.querySelectorAll("canvas").length,
  }));
  log.push("after play: " + JSON.stringify(alive));

  await page.waitForTimeout(2000);
  await page.screenshot({ path: "design/store/screen_02_gameplay.png" });
  log.push("gameplay captured");

  // Try answering: look for option buttons
  const opts = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .map(b => b.innerText.replace(/\s+/g, " ").trim())
      .filter(t => t && t.length < 40).slice(0, 20)
  );
  log.push("visible buttons: " + JSON.stringify(opts));
  return log.join("\n");
}
