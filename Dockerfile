# The build must work on CPUs without AVX2 (the production server is a Xeon E5-1620 v2).
# That is why the project stays on Astro 5 (esbuild + WebAssembly compiler) and swaps
# Rollup's native binary for @rollup/wasm-node via "overrides" in package.json.
# Don't upgrade Astro without checking: Astro 7 (Vite 8) adds Rust-native build tools
# that crashed on this server.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATABASE_PATH=/app/data/signal-lab.sqlite
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# The scanner runs from source with Node's built-in TypeScript support.
COPY src/lib ./src/lib
COPY scripts ./scripts
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/entry.mjs"]
