# API Server para d_d_asistant

Este es el servidor de APIs para "d_d_asistant". Está construido con Node.js y Express.js.

## Requisitos

- Node.js (versión 12 o superior)
- MySQL (versión 5.7 o superior)

## Complementos utilizados

- [morgan](https://www.npmjs.com/package/morgan): Middleware de registro de solicitudes HTTP para Node.js.
- [winston](https://www.npmjs.com/package/winston): Un registrador universal con soporte para múltiples transportes.
- [body-parser](https://www.npmjs.com/package/body-parser): Middleware de análisis de cuerpo de solicitud HTTP para Node.js.
- [crypto](https://nodejs.org/api/crypto.html): Módulo de criptografía incluido en Node.js, utilizado para cifrar contraseñas de usuarios.
- [cors](https://www.npmjs.com/package/cors): Middleware para habilitar CORS (Cross-Origin Resource Sharing) en nuestras rutas/APIs.

## Instalación

1. Clona este repositorio en tu máquina local.
    ```
    git clone https://github.com/username/my-app-api.git
    ```
2. Navega al directorio del proyecto.
    ```
    cd apiRest
    ```
3. Instala las dependencias del proyecto.
    ```
    npm install
    ```
5. Inicia el servidor.
    ```
    npm start
    ```
    
## Uso

El servidor se iniciará en [http://localhost:3000](http://localhost:3000) (o cualquier puerto que hayas especificado en tus variables de entorno).

## Documentación de la API

La api accede a la base de datos para d_d_asistant, haciendo todas las consultas que requiera la aplicacion, esta parte tambien se encarga del encriptamiento de contraseñas de usuarios.

## Contribución

Si deseas contribuir a este proyecto, por favor, abre un 'pull request'. Agradesco cualquier contribución.

