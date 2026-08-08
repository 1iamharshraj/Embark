import sharp from "sharp";
import { readFile, copyFile } from "fs/promises";
import { join } from "path";

const PUBLIC = join(process.cwd(), "public");

async function main() {
  const svg192 = await readFile(join(PUBLIC, "icon-192.svg"), "utf-8");
  const svg512 = await readFile(join(PUBLIC, "icon-512.svg"), "utf-8");

  // Standard PWA icons from the existing SVGs
  await sharp(Buffer.from(svg192), { density: 96 })
    .resize(192, 192)
    .png()
    .toFile(join(PUBLIC, "icon-192x192.png"));
  console.log("Generated public/icon-192x192.png");

  await sharp(Buffer.from(svg512), { density: 96 })
    .resize(512, 512)
    .png()
    .toFile(join(PUBLIC, "icon-512x512.png"));
  console.log("Generated public/icon-512x512.png");

  // Apple touch icon (use 192 source, output 180)
  await sharp(Buffer.from(svg192), { density: 96 })
    .resize(180, 180)
    .png()
    .toFile(join(PUBLIC, "apple-touch-icon.png"));
  console.log("Generated public/apple-touch-icon.png");

  // Maskable icon: logo centered in the safe zone (~70% of canvas) so it survives any crop shape.
  const size = 192;
  const scale = 0.65; // 65% of the original logo size within the 192 canvas
  const offset = size * (1 - scale) / 2;
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#F4F7FC"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <text x="96" y="108" text-anchor="middle" font-family="system-ui, sans-serif" font-size="80" font-weight="800" fill="#161616">e</text>
    <text x="108" y="118" text-anchor="middle" font-family="system-ui, sans-serif" font-size="60" font-weight="800" fill="#2E6BFF">M</text>
  </g>
</svg>`;
  await sharp(Buffer.from(maskableSvg), { density: 96 })
    .resize(192, 192)
    .png()
    .toFile(join(PUBLIC, "maskable-icon-192x192.png"));
  console.log("Generated public/maskable-icon-192x192.png");

  // Favicon: reuse the existing app/favicon.ico (already a multi-size ICO).
  await copyFile(join(process.cwd(), "app", "favicon.ico"), join(PUBLIC, "favicon.ico"));
  console.log("Copied app/favicon.ico to public/favicon.ico");

  console.log("\nAll PWA icons generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
