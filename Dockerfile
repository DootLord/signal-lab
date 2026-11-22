FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run selfhost:build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/app/data/signal-lab.sqlite
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist-selfhost ./dist-selfhost
COPY --from=build /app/app/lib/data.ts ./app/lib/data.ts
COPY --from=build /app/app/lib/domain.ts ./app/lib/domain.ts
COPY --from=build /app/selfhost/server.ts /app/selfhost/import.ts /app/selfhost/scan.mjs ./selfhost/
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "selfhost/server.ts"]
