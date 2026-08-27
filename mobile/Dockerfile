FROM node:22-alpine

WORKDIR /app

# Install dependencies first so source changes don't invalidate this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Metro's dev server; the browser talks to it directly for HMR.
EXPOSE 8081

# No TTY here to press keys in, and CI=1 would disable Metro's watch mode.
ENV EXPO_NO_TELEMETRY=1

CMD ["npm", "run", "web", "--", "--port", "8081"]
