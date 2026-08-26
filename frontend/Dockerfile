FROM node:22-alpine

WORKDIR /app

# Install dependencies first so source changes don't invalidate this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
