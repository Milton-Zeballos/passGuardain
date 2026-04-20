# Usa una imagen oficial de Node.js basada en Alpine para que sea ultraligera
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para aprovechar la caché de Docker
# Si usas yarn o pnpm, cambia el package-lock.json por yarn.lock o pnpm-lock.yaml
COPY package.json package-lock.json* ./

# Instala las dependencias de Node
RUN npm install

# Copia el resto del código de tu aplicación
COPY . .

# Expone los puertos necesarios. 
# 8081 es el puerto estándar de Metro Bundler.
# 19000, 19001, 19002 son usados por Expo (si aplica a tu proyecto).
EXPOSE 8081 19000 19001 19002

# Variable de entorno crítica para Expo/React Native en Docker.
# Obliga a Metro a escuchar en todas las interfaces de red, no solo en localhost del contenedor.
ENV HOST=0.0.0.0

# Comando para iniciar el empaquetador
# Usa "npm run start" o "npx expo start" dependiendo de tu package.json
CMD ["npx", "expo", "start", "--tunnel"]