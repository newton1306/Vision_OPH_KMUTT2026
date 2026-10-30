const fs = require('fs');
const path = require('path');

function createSimpleIco(width, height, drawFn) {
  const bpp = 32;
  const imageSize = width * height * 4;
  const maskRowSize = Math.floor((width + 31) / 32) * 4;
  const maskSize = maskRowSize * height;
  const headerSize = 40;
  const totalImageBytes = headerSize + imageSize + maskSize;

  const icoBuffer = Buffer.alloc(6 + 16 + totalImageBytes);

  // ICONDIR
  icoBuffer.writeUInt16LE(0, 0); // Reserved
  icoBuffer.writeUInt16LE(1, 2); // Type: 1 = ICO
  icoBuffer.writeUInt16LE(1, 4); // 1 Image

  // ICONDIRENTRY
  // In ICO format, 256 is stored as 0
  icoBuffer.writeUInt8(width === 256 ? 0 : width, 6);
  icoBuffer.writeUInt8(height === 256 ? 0 : height, 7);
  icoBuffer.writeUInt8(0, 8); // Color count
  icoBuffer.writeUInt8(0, 9); // Reserved
  icoBuffer.writeUInt16LE(1, 10); // Color planes
  icoBuffer.writeUInt16LE(bpp, 12); // Bits per pixel
  icoBuffer.writeUInt32LE(totalImageBytes, 14); // Size of image data
  icoBuffer.writeUInt32LE(22, 18); // Offset to image data

  // BITMAPINFOHEADER
  let offset = 22;
  icoBuffer.writeUInt32LE(40, offset); // Header size
  icoBuffer.writeInt32LE(width, offset + 4);
  icoBuffer.writeInt32LE(height * 2, offset + 8); // Height x2 for XOR + AND masks
  icoBuffer.writeUInt16LE(1, offset + 12); // Planes
  icoBuffer.writeUInt16LE(bpp, offset + 14); // Bit count
  icoBuffer.writeUInt32LE(0, offset + 16); // Compression (BI_RGB)
  icoBuffer.writeUInt32LE(imageSize + maskSize, offset + 20); // Image size
  icoBuffer.writeInt32LE(0, offset + 24); // X pixels per meter
  icoBuffer.writeInt32LE(0, offset + 28); // Y pixels per meter
  icoBuffer.writeUInt32LE(0, offset + 32); // Colors used
  icoBuffer.writeUInt32LE(0, offset + 36); // Colors important

  offset += 40;

  // Pixel data: bottom-up BGRA
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      icoBuffer.writeUInt8(b, offset);
      icoBuffer.writeUInt8(g, offset + 1);
      icoBuffer.writeUInt8(r, offset + 2);
      icoBuffer.writeUInt8(a, offset + 3);
      offset += 4;
    }
  }

  // Mask: all zeros (0 = transparent controlled by alpha)
  icoBuffer.fill(0, offset, offset + maskSize);

  return icoBuffer;
}

// Generate Fruit Ninja Icon (256x256)
const fruitNinjaIco = createSimpleIco(256, 256, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist > 120) return [0, 0, 0, 0];
  if (dist > 104) return [45, 106, 79, 255]; // Green rind
  if (dist > 92) return [216, 243, 220, 255]; // White rim
  return [239, 35, 60, 255]; // Red watermelon flesh
});

// Generate CV Workshop Icon (256x256)
const cvWorkshopIco = createSimpleIco(256, 256, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  if (dist > 120) return [0, 0, 0, 0];
  if (dist > 104) return [99, 102, 241, 255]; // Indigo border
  if (dist < 40) return [255, 255, 255, 255]; // White pupil
  if (dist < 72) return [56, 189, 248, 255]; // Sky blue iris
  return [15, 23, 42, 255]; // Dark background
});

fs.mkdirSync(path.join(__dirname, '../build'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../build/fruit_ninja.ico'), fruitNinjaIco);
fs.writeFileSync(path.join(__dirname, '../build/cv_workshop.ico'), cvWorkshopIco);
fs.writeFileSync(path.join(__dirname, '../build/icon.ico'), cvWorkshopIco);

console.log('256x256 Icons generated successfully in build/');
