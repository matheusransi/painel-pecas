import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [,, w, h, outDir, fps = '30', only] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto('file://' + process.cwd() + `/anim.html?w=${w}&h=${h}`);
await page.evaluate(() => window.ready);
const dur = await page.evaluate(() => window.DURATION);
const times = only ? only.split(',').map(Number) : [...Array(Math.round(dur * fps)).keys()].map(i => i / fps);
for (let i = 0; i < times.length; i++) {
  const data = await page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, times[i]);
  fs.writeFileSync(`${outDir}/f${String(i).padStart(5, '0')}.png`, Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close();
console.log('frames', times.length);
