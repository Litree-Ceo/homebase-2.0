# Multi-stage Dockerfile for Azure Functions API
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY packages/core/package.json ./packages/core/
RUN pnpm install --frozen-lockfile --filter api...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter api build

FROM mcr.microsoft.com/azure-functions/node:4-node20-alpine
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    NODE_ENV=production

COPY --from=builder /app/api/dist /home/site/wwwroot
COPY --from=builder /app/api/node_modules /home/site/wwwroot/node_modules
COPY --from=builder /app/api/host.json /home/site/wwwroot/

EXPOSE 5001
