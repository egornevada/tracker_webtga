# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Патчим ESM-импорты в dist на .js, чтобы узел не падал
RUN sed -i 's#\("./auth/telegram"\)#\1.js#g' dist/server.js \
 && sed -i 's#\("./routes/tasks"\)#\1.js#g' dist/server.js \
 && sed -i 's#\("./prisma"\)#\1.js#g' dist/server.js

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 8080
CMD ["node","dist/server.js"]
