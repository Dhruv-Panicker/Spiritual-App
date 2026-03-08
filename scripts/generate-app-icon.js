/**
 * Generates app-icon.png from om_logo_transparent.png for the "outside" app icon:
 * - 1024x1024 canvas (Expo icon size)
 * - OM logo scaled to ~95% so it appears bigger on the icon
 * - Shifted slightly right for optical center
 *
 * Run: npm run generate-icon
 * Requires: sharp (npm install --save-dev sharp)
 */
const path = require('path');
const fs = require('fs');

const SIZE = 1024;
const LOGO_SCALE = 0.95; // logo fills 95% of canvas (OM symbol bigger on icon)
const SHIFT_RIGHT_PX = 36; // nudge right to center properly

const projectRoot = path.resolve(__dirname, '..');
const logoPath = path.join(projectRoot, 'assets/images/om_logo_transparent.png');
const outPath = path.join(projectRoot, 'assets/images/app-icon.png');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (_) {
    console.error('Missing "sharp". Install with: npm install --save-dev sharp');
    process.exit(1);
  }

  if (!fs.existsSync(logoPath)) {
    console.error('Logo not found:', logoPath);
    process.exit(1);
  }

  const logo = sharp(logoPath);
  const meta = await logo.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;

  const maxLogoSide = Math.round(SIZE * LOGO_SCALE);
  const scale = Math.min(maxLogoSide / w, maxLogoSide / h, 1);
  const newW = Math.round(w * scale);
  const newH = Math.round(h * scale);

  const left = Math.round((SIZE - newW) / 2 + SHIFT_RIGHT_PX);
  const top = Math.round((SIZE - newH) / 2);

  const resizedLogo = await logo
    .resize(newW, newH)
    .toBuffer();

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png()
    .toFile(outPath);

  console.log('Generated:', outPath);
  console.log('OM logo on icon: larger (', newW, 'x', newH, ') and shifted right by', SHIFT_RIGHT_PX, 'px');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
