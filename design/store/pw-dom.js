async (page) => {
  const log = [];
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.innerText.includes("PLAY ALL 20 CHAPTERS"));
    b && b.click();
  });
  await page.waitForTimeout(6000);

  const info = await page.evaluate(() => {
    const tree = [];
    const walk = (el, depth) => {
      if (depth > 4) return;
      for (const c of el.children) {
        tree.push("  ".repeat(depth) + c.tagName + (c.id ? "#" + c.id : "") + (c.className && typeof c.className === "string" ? "." + c.className.split(" ").slice(0, 4).join(".") : "") + " [" + (c.childElementCount) + " children]");
        walk(c, depth + 1);
      }
    };
    walk(document.body, 0);
    return {
      tree: tree.join("\n").slice(0, 2500),
      canvases: document.querySelectorAll("canvas").length,
      iframes: document.querySelectorAll("iframe").length,
      bodyText: (document.body.innerText || "").slice(0, 300),
    };
  });
  return JSON.stringify(info, null, 1);
}
