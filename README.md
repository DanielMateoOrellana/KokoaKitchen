# KokoaKitchen
¡Bienvenido a KokoaKitchen! Este es un proyecto desarrollado para el ingreso al club Kokoa de ESPOL. KokoaKitchen es una aplicación web centrada en la búsqueda de alimentos utilizando la API de Nutritionix. Los usuarios pueden buscar productos alimenticios, ver sus detalles nutricionales, y agregar estos productos a un carrito de compras.

## Características
* Búsqueda en Tiempo Real: Busca alimentos y productos utilizando la API de Nutritionix.
* Filtro de Resultados: Filtra productos con o sin imágenes para facilitar la navegación.
* Carrito de Compras: Añade productos al carrito y administra los productos seleccionados.
* Interfaz Interactiva: Las tarjetas de productos incluyen efectos de hover y se pueden expandir para ver detalles adicionales.
* Estilizado Moderno: La aplicación utiliza un fondo oscuro para hacer resaltar las tarjetas y los elementos de la interfaz.

## Tecnologías Utilizadas
* Frontend: React, Bootstrap
* Backend: Node.js, Express
* API: Nutritionix API
  
## Requisitos Previos
Antes de comenzar, asegúrate de tener instalado lo siguiente:
* Node.js (v14 o superior)
* npm (v6 o superior)

## Instrucciones para Desarrolladores

Clonar el Repositorio
Primero, clona este repositorio en tu máquina local:

```git clone https://github.com/DanielMateoOrellana/KokoaKitchen.git```
```cd KokoaKitchen```

Configuración del Backend
Navega a la carpeta del backend:

```cd backend```

Instala las dependencias necesarias:

```npm install```

Crea un archivo .env en la carpeta backend y añade tus credenciales de la API de Nutritionix:

```NUTRITIONIX_API_KEY=tu_api_key_aqui```
```NUTRITIONIX_APP_ID=tu_app_id_aqui```

Inicia el servidor backend:

```node server.js```

Configuración del Frontend
Navega a la carpeta del frontend:

```cd ../frontend```

Instala las dependencias necesarias:

```npm install```

Inicia la aplicación React:

```npm start```

Acceder a la Aplicación
Una vez que tanto el frontend como el backend estén en funcionamiento, abre tu navegador y visita:

```http://localhost:3000```

## Contribuir
Las contribuciones son bienvenidas. Por favor, sigue las siguientes pautas:

* Haz un fork del repositorio.
* Crea una nueva rama (```git checkout -b feature/nueva-caracteristica```).
* Haz commit de tus cambios (```git commit -m 'Añadir nueva característica'```).
* Haz push a la rama (```git push origin feature/nueva-caracteristica```).
* Abre un Pull Request.
## Licencia
Este proyecto está licenciado bajo la MIT License. Consulta el archivo LICENSE para más detalles.
