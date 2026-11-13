FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui-tokens/package*.json ./packages/ui-tokens/
COPY packages/sim-engine/package*.json ./packages/sim-engine/
COPY apps/worker/package*.json ./apps/worker/

RUN npm install

COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/

RUN cd apps/worker && npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package*.json ./apps/worker/

CMD ["node", "apps/worker/dist/index.js"]
