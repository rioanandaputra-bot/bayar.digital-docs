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

RUN apk add --no-cache bash && rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD nginx -t || exit 1

STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off; error_log /dev/stderr info;"]

EXPOSE 80
