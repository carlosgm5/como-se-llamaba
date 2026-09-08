// Envuelve como-se-llamaba.html (el archivo que se publica como artifact, y que
// por eso no lleva doctype ni head) en una página completa e instalable.
// Uso: node build-pwa.js

const fs = require("fs");
const path = require("path");

const raiz = __dirname;
const fuente = path.join(raiz, "como-se-llamaba.html");
const destino = path.join(raiz, "docs", "index.html");

let cuerpo = fs.readFileSync(fuente, "utf8");

const mTitulo = cuerpo.match(/<title>([\s\S]*?)<\/title>/i);
const titulo = mTitulo ? mTitulo[1].trim() : "Cómo se llamaba";
cuerpo = cuerpo.replace(/<title>[\s\S]*?<\/title>\s*/i, "");

const links = (cuerpo.match(/<link\b[^>]*>/gi) || []).map(s => "  " + s.trim());
cuerpo = cuerpo.replace(/<link\b[^>]*>\s*/gi, "");

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${titulo}</title>
  <meta name="description" content="Registro de personas con GPS: filtra por cualidad, categoria, lugar, zona y cercania.">
  <meta name="theme-color" content="#2547C4" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#11151B" media="(prefers-color-scheme: dark)">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="icon-192.png">
${links.join("\n")}
  <style>
    /* Mismo suelo que aplica el visor de artifacts, para que se vea igual fuera. */
    html{color-scheme:light dark}
    body{margin:0; font:14px system-ui, -apple-system, sans-serif}
    img{max-width:100%}
    [hidden]{display:none !important}
  </style>
</head>
<body>
${cuerpo.trim()}
</body>
</html>
`;

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, html, "utf8");
console.log("docs/index.html generado — " + html.length + " bytes");
