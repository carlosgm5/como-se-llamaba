# Cómo se llamaba

App para acordarse de los nombres de la gente que vas conociendo: la registras en cinco
segundos y luego la encuentras por nombre, por una característica que recuerdes, o por
quién tienes alrededor ahora mismo.

**App instalable:** https://carlosgm5.github.io/como-se-llamaba/

Ábrela en Chrome en el móvil y usa *Instalar aplicación*. Queda en el cajón de apps, abre
sin conexión y no necesita iniciar sesión en nada.

## Qué hace

- **Añadir** — nombre, categoría, lugar y una nota libre. La categoría y el lugar se quedan
  puestos entre fichas, así que en una visita seguida no tocas nada. Con el GPS activo, la
  posición se graba sola al guardar.
- **Gente** — tres formas de buscar: por *nombre*, por *característica* (busca en las notas)
  y *cerca de mí* (quién está en un radio de 500 m, ajustable). Encima se pueden combinar
  filtros de categoría y lugar.
- **Más** — estadísticas, exportar e importar JSON.

## Dónde viven los datos

En el propio navegador (`localStorage`). No se envían a ningún servidor: no hay backend.
Exporta a JSON para tener copia o mudarte a otro dispositivo.

Si la misma página se abre como artifact dentro de claude.ai, usa el almacén de Claude para
sincronizar entre dispositivos y habilita el "volcado del día", que separa un párrafo escrito
de corrido en fichas sueltas. Fuera de ahí esas dos cosas se apagan solas y el resto funciona
igual.

## Estructura

    como-se-llamaba.html   la app entera, en un archivo (sin doctype: se publica como artifact)
    build-pwa.js           la envuelve en una página completa e instalable -> docs/index.html
    make-icons.js          rasteriza los iconos PNG que Chrome exige para instalarla
    docs/                  lo que sirve GitHub Pages

Tras editar `como-se-llamaba.html`:

    node build-pwa.js

Y para regenerar los iconos:

    node make-icons.js

## Limitación conocida

Dentro del artifact de Claude el GPS no funciona: la página va en un iframe que no cede el
permiso de geolocalización, así que el navegador lo deniega sin llegar a preguntar. Por eso
existe la versión instalable. La app lo detecta y lo explica en vez de dar un error a secas.

Tampoco hay geocodificación inversa (convertir coordenadas en un nombre de calle), porque no
hay servidor al que preguntar. En su lugar las posiciones se agrupan solas en zonas por
proximidad y cada zona toma el nombre del lugar que más se repite en ella.
