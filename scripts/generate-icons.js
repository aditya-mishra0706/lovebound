import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  console.log('Generating PWA and phone app PNG icons...');

  // 1. 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));
  console.log('Created public/pwa-192x192.png');

  // 2. 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));
  console.log('Created public/pwa-512x512.png');

  // 3. Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('Created public/apple-touch-icon.png');

  // 4. Maskable 512x512 PNG (Icon padded by 15% on background for Android squircle crop)
  const innerSize = Math.round(512 * 0.76); // ~390px
  const innerBuffer = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 12, b: 32, alpha: 1 },
    },
  })
    .composite([{ input: innerBuffer, gravity: 'center' }])
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));
  console.log('Created public/pwa-maskable-512x512.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
