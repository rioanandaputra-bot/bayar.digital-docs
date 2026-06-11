FROM oven/bun:alpine AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

COPY . .

FROM base AS development

EXPOSE 3000

CMD ["bun", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]

FROM base AS build

RUN bun run build

FROM nginx:1-alpine

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN chown -R appuser:appgroup /usr/share/nginx/html /etc/nginx/conf.d /var/cache/nginx /var/log/nginx
USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
