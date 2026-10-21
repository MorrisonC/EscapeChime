async (page) => {
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const overlays = [...document.querySelectorAll("div.absolute.inset-0")].map(d => ({
      cls: d.className.slice(0, 120),
      text: (d.innerText || "").slice(0, 400),
      buttons: [...d.querySelectorAll("button")].map(b => b.innerText || b.title).slice(0, 10),
    }));
    return {
      overlays,
      ls: Object.keys(localStorage).map(k => k + "=" + String(localStorage.getItem(k)).slice(0, 80)),
    };
  });
  return JSON.stringify(info, null, 1).slice(0, 2500);
}
