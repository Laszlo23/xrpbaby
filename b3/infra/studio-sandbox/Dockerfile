# BC Studio preview sandbox — Vite dev server per project
FROM node:20-alpine

RUN addgroup -S studio && adduser -S studio -G studio
WORKDIR /workspace
RUN chown studio:studio /workspace

USER studio

# Pre-install common deps when workspace has package.json (sync overwrites files)
COPY --chown=studio:studio entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5173
ENTRYPOINT ["/entrypoint.sh"]
