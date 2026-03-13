# Estructura del Proyecto Frontend (GestionEmpleados)

¡Hola! Este documento es una guía paso a paso para que entiendas cómo está organizado este proyecto y qué piezas lo hacen funcionar, explicado de forma sencilla.

## Tecnologías Principales (Las herramientas que usamos)

Nuestro proyecto usa herramientas modernas muy populares en el mundo del desarrollo web:

- **Next.js**: Es nuestro "Framework" (marco de trabajo) principal. Next.js hace que arrancar un proyecto sea mucho más fácil: nos organiza las carpetas automáticamente para crear nuevas páginas web y se encarga de que todo cargue muy rápido para el usuario final.
- **React**: Es la librería con la que construimos la interfaz (botones, textos, imágenes). Con React, en lugar de armar una página entera de golpe, construimos pequeños bloques de Lego individuales (llamados "componentes", por ejemplo un `<BotonRojo />`) y los encastramos para armar la página.
- **Tailwind CSS**: Es nuestra herramienta para darle colores y diseño a la página rápidamente. En lugar de escribir archivos de estilos separados larguísimos, escribimos pequeñas palabras clave (clases) directamente al lado de nuestro código HTML, como por ejemplo `bg-blue-500` para pintar el fondo de azul.
- **TypeScript**: Es una versión mejorada y más estricta de JavaScript. Su principal cualidad es que nos obliga a decir de antemano "qué tipo de dato" es cada variable (por ejemplo, nos obliga a aclarar que "edad" va a ser un número, y "nombre" va a ser un texto). Gracias a esta claridad, el propio programa nos subraya errores *mientras escribimos el código* en nuestro editor, evitándonos dolores de cabeza gigantes en el futuro.

## Estructura de Carpetas

La carpeta más importante para vos es `/src` (viene de *source* o código fuente). Ahí es donde vas a trabajar y escribir el 99% de tu código.

### `/src` - ¡Acá pasa la magia!

- **`/src/app`**: Aquí funciona el sistema de páginas (conocido como **App Router**). Funciona así de fácil: cada carpeta que creás acá adentro (como `/src/app/contacto`) se convierte automáticamente en una nueva página navegable en tu web (`tusitio.com/contacto`).
  - `layout.tsx`: Es el "molde" o "esqueleto" visual de tu sitio web. Lo que pongas acá (como por ejemplo, un menú superior o un pie de página) se va a repetir en *todas* las páginas de tu sitio para que no tengas que escribirlo una y otra vez manualmente.
  - `page.tsx`: Es el contenido específico de la página inicial (la "home", es decir, la pantalla que ves apenas entrás a la URL principal, como `localhost:3000`).
  - `globals.css`: Acá ponemos configuraciones globales de diseño. Casi nunca lo vas a tocar; sirve principalmente para inicializar las herramientas de Tailwind CSS al inicio del proyecto.

- **`/src/actions`**: Contiene lo que llamamos **Server Actions** (Acciones de Servidor).
  - *¿Qué es un Server Action en español simple?* En React, casi todo tu código se envía para ejecutarse en la compu o celular del usuario (lo que llamamos el "cliente"). Pero hay operaciones secretas o delicadas, como consultar una base de datos o verificar una contraseña, que por seguridad *nunca* deben ejecutarse en la compu del usuario, sino en el servidor privado de tu empresa. En Next.js, un "Server Action" te permite crear una función especial que vos llamás desde el código de tu usuario (tipo "al hacer clic enviar formulario"), pero que en realidad viaja por atrás y se ejecuta de manera oculta y 100% segura en tu servidor.
  - `auth.ts`: Siguiendo lo anterior, aquí guardamos los Server Actions súper seguros que manejan cosas como comparar contraseñas para iniciar o cerrar sesión.

- **`/src/lib`**: Viene de "Library" (librería). Es el cajón de utilidades de nuestro proyecto. Acá guardamos funciones sueltas y calculadoras que queremos reutilizar en distintas partes de la web, para no tener que copiar y pegar el mismo código en varios lugares.
  - **`/api`**: Aquí archivamos las pequeñas configuraciones y funciones encargadas de hablar con el verdadero backend/base de datos (por ejemplo, preparar qué datos mandar para "crear un nuevo empleado").
  - **`/auth`**: Configuraciones generales sobre cómo manejamos si un usuario está actualmente activo o debemos pedirle que vuelva a iniciar sesión.

### Archivos de Configuración (en la raíz del proyecto)

Afuera de `src`, sueltos en la carpeta principal, hay muchos archivos feos de configuración. Por lo general los configuramos el primer día del proyecto y no los volvemos a mirar, pero esto es lo que hacen para que sirva de referencia:

- **`package.json`**: Es el "DNI" de tu proyecto y su "lista del supermercado". Anota cómo se llama tu proyecto, y lista todas las librerías externas que le hemos instalado para que Next, React y Tailwind funcionen. También incluye atajos de comandos (como el famoso comando `npm run dev` para iniciar nuestra página en tu compu).
- **`next.config.ts`**: Acá le damos instrucciones avanzadas a Next.js (por ejemplo, decirle que comprima las imágenes o cambie la dirección de un servidor al momento de publicar la página entera en internet para el público).
- **`postcss.config.mjs`**: Es un traductor. Se encarga de traducir nuestras palabras de Tailwind (ej: `text-red-300`) a reglas CSS tradicionales estándar que navegadores viejos como Safari o Chrome puedan leer.
- **`tsconfig.json`**: El archivo que le dice a TypeScript si tiene que ser muy permisivo con nosotros o extremadamente estricto cuando revisa que no le erremos con los tipos de datos (texto, número, verdaderos/falsos).
- **`eslint`**: El archivo `eslint.config.mjs` configura algo llamado "Linter". Imaginate que es un corrector gramatical automático para programadores: va leyendo tu texto y te subraya en línea roja si cometiste una desprolijidad de código o si algo rompe el estilo de escritura recomendado en toda la industria.
- **`.gitignore`**: Es una "lista negra" para Git (la herramienta que usamos para guardar el código en la nube como en GitHub o GitLab). Le indica exactamente qué archivos u otras carpetas **NO** debe subir jamás a internet (por ejemplo, la carpeta `node_modules` no se sube porque pesa gigabytes y se descarga sola con `package.json`, o contraseñas reales que dejarían vulnerable el proyecto).
- **`/public`**: La carpeta de contenido aburrido pero necesario. Usamos esta carpeta para guardar imágenes estáticas que queramos mostrar en la web, logos para las pestañas del navegador o instaladores de letras tipográficas que queramos usar. Lo que pongas acá se puede acceder de la web con sólo llamarlo, por ejemplo: `tu-pagina.com/logo-header.png`.