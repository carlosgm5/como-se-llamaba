// Genera docs/icon-192.png y docs/icon-512.png rasterizando la misma composicion
// que icon.svg. Chrome exige PNG de 192 y 512 para instalar una PWA como app.
// Uso: node make-icons.js

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const AZUL = [0x25, 0x47, 0xC4];
const PAPEL = [0xFB, 0xFC, 0xFD];
const GRIS = [0xC0, 0xC9, 0xD6];

// En el sistema de coordenadas del SVG (512x512). Todo cae dentro del circulo
// seguro del 80% que exige un icono maskable.
const FORMAS = [
  { x:136, y:140, w:240, h:232, r:18, c:PAPEL },
  { x:166, y:178, w:152, h:30,  r:7,  c:AZUL  },
  { x:166, y:246, w:180, h:13,  r:6.5, c:GRIS },
  { x:166, y:284, w:148, h:13,  r:6.5, c:GRIS },
  { x:166, y:322, w:106, h:13,  r:6.5, c:GRIS }
];

// Distancia con signo a un rectangulo redondeado: <=0 dentro.
function sd(px, py, f){
  const cx = f.x + f.w/2, cy = f.y + f.h/2;
  const qx = Math.abs(px - cx) - (f.w/2 - f.r);
  const qy = Math.abs(py - cy) - (f.h/2 - f.r);
  return Math.hypot(Math.max(qx,0), Math.max(qy,0)) + Math.min(Math.max(qx,qy), 0) - f.r;
}

function render(size){
  const SS = 3;                       // supersampling para dientes de sierra
  const px = Buffer.alloc(size*size*4);
  const escala = 512 / size;
  for(let y = 0; y < size; y++){
    for(let x = 0; x < size; x++){
      let r = 0, g = 0, b = 0;
      for(let sy = 0; sy < SS; sy++){
        for(let sx = 0; sx < SS; sx++){
          const mx = (x + (sx + 0.5)/SS) * escala;
          const my = (y + (sy + 0.5)/SS) * escala;
          let c = AZUL;
          for(const f of FORMAS) if(sd(mx, my, f) <= 0) c = f.c;
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = SS*SS, i = (y*size + x)*4;
      px[i]   = Math.round(r/n);
      px[i+1] = Math.round(g/n);
      px[i+2] = Math.round(b/n);
      px[i+3] = 255;
    }
  }
  return px;
}

const TABLA = (() => {
  const t = new Int32Array(256);
  for(let n = 0; n < 256; n++){
    let c = n;
    for(let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf){
  let c = 0xFFFFFFFF;
  for(let i = 0; i < buf.length; i++) c = TABLA[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function trozo(tipo, datos){
  const len = Buffer.alloc(4); len.writeUInt32BE(datos.length, 0);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(cuerpo), 0);
  return Buffer.concat([len, cuerpo, crc]);
}
function png(size, px){
  const ancho = size*4;
  const crudo = Buffer.alloc((ancho + 1) * size);
  for(let y = 0; y < size; y++){
    crudo[y*(ancho+1)] = 0;                                   // filtro: ninguno
    px.copy(crudo, y*(ancho+1) + 1, y*ancho, (y+1)*ancho);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;                                   // 8 bits, RGBA
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    trozo("IHDR", ihdr),
    trozo("IDAT", zlib.deflateSync(crudo, { level:9 })),
    trozo("IEND", Buffer.alloc(0))
  ]);
}

const destino = path.join(__dirname, "docs");
fs.mkdirSync(destino, { recursive: true });
for(const size of [192, 512]){
  const archivo = path.join(destino, "icon-" + size + ".png");
  fs.writeFileSync(archivo, png(size, render(size)));
  console.log("icon-" + size + ".png — " + fs.statSync(archivo).size + " bytes");
}
