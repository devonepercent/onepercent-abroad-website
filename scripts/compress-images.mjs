import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const targets = [
  { in: "src/assets/uni/ceu.jpg",  out: "src/assets/uni/ceu.png",  width: 240, fmt: "png" },
  { in: "src/assets/uni/pisa.png", out: "src/assets/uni/pisa.png", width: 240, fmt: "png" },
  { in: "src/assets/logo-blue.png",  out: "src/assets/logo-blue.png",  width: 480, fmt: "png" },
  { in: "src/assets/logo-white.png", out: "src/assets/logo-white.png", width: 480, fmt: "png" },
];

for (const t of targets) {
  try {
    const inBytes = (await stat(t.in)).size;
    const buf = await readFile(t.in);
    const pipe = sharp(buf).resize({ width: t.width, withoutEnlargement: true });
    const out = await (t.fmt === "png"
      ? pipe.png({ compressionLevel: 9, palette: true }).toBuffer()
      : pipe.webp({ quality: 82 }).toBuffer());
    await writeFile(t.out, out);
    const outBytes = (await stat(t.out)).size;
    const pct = ((1 - outBytes / inBytes) * 100).toFixed(0);
    console.log(`${path.basename(t.in)}: ${(inBytes / 1024).toFixed(1)}KB -> ${(outBytes / 1024).toFixed(1)}KB (-${pct}%)`);
  } catch (e) {
    console.error(`FAIL ${t.in}:`, e.message);
  }
}
