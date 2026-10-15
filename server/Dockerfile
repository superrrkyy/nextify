FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server ./
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
