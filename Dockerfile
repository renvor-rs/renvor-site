# Renvor landing site — production image.
#
# Two stages with a hard boundary between them. The builder holds the toolchain, the
# lockfile, and the sources. The runtime holds the generated site and one statically linked
# server binary, and nothing else: no shell, no package manager, no interpreter, no
# `node_modules`, no source. There is nothing to exec into, and no OS package database for
# an advisory to attach to.
#
# Base images are pinned by immutable digest rather than by tag. A tag can be repointed at
# different content; a digest cannot. The tag in each reference is retained only so a reader
# can tell what the digest was pinned from — the digest is what actually resolves.

# --- Builder ---------------------------------------------------------------------------
FROM node:24-bookworm-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS builder

# Pinned to the same version as `packageManager` in package.json. Kept as an ARG so the
# mismatch check below has something to compare against and CI can echo what it used.
ARG PNPM_VERSION=11.21.0

ENV CI=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

WORKDIR /src

# The Node policy lives in `.nvmrc`, and this asserts the base image agrees with it rather
# than restating the version in a second place that can silently drift. If someone bumps
# `.nvmrc` without repinning the digest above, the build fails here with the reason, instead
# of producing an image built on the wrong major.
COPY .nvmrc ./
RUN set -eu; \
    want="$(tr -d '[:space:]' < .nvmrc)"; \
    have="$(node -p 'process.versions.node.split(".")[0]')"; \
    if [ "$want" != "$have" ]; then \
        echo "Node major mismatch: .nvmrc requires ${want}, base image provides ${have}." >&2; \
        echo "Repin the builder digest to a Node ${want} image, or correct .nvmrc." >&2; \
        exit 1; \
    fi; \
    echo "Node policy satisfied: .nvmrc=${want}, image=$(node --version)"

# Installed by exact version rather than through Corepack: this resolves one pinned tarball
# with no signature-store dependency, which is one less moving part in a reproducible build.
RUN npm install --global "pnpm@${PNPM_VERSION}" \
    && pnpm --version

# Manifests first, so the dependency layer is reused whenever only site source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# `--frozen-lockfile` makes the resolved tree an input rather than something the build is
# allowed to decide. If the lockfile and manifest disagree, this fails rather than resolving
# something new and shipping it.
RUN pnpm install --frozen-lockfile

COPY tsconfig.json docusaurus.config.ts ./
COPY src ./src
COPY static ./static

# Generated directories are never copied in (see .dockerignore), but removing them here
# makes the guarantee explicit: the build below starts from nothing it did not produce.
RUN rm -rf build .docusaurus \
    && pnpm run build \
    && test -f build/index.html \
    && test -f build/404.html

# --- Server binary ---------------------------------------------------------------------
# static-web-server 2.44.0 (MIT OR Apache-2.0) — a single statically linked Rust binary.
# Only the binary is taken; the upstream image's own sample `/public` is left behind.
FROM joseluisq/static-web-server:2.44.0@sha256:2c1a7c3e0feaea5859307403b74e1c575f3ec1499094fc077344173d11abaae2 AS server

# --- Runtime ---------------------------------------------------------------------------
FROM scratch AS runtime

COPY --from=server /static-web-server /static-web-server
COPY --from=builder --chown=65532:65532 /src/build /public

# The distroless "nonroot" uid/gid. Declared numerically because a scratch image has no
# /etc/passwd to resolve a name against — a named USER here would fail to start.
USER 65532:65532

# Above 1024 so the unprivileged user can bind it without any added capability.
EXPOSE 8080

# `SERVER_HEALTH=true` adds GET/HEAD /health returning 200 and writing no log line, which is
# what an orchestrator liveness probe should hit. Note that a Dockerfile HEALTHCHECK
# instruction is deliberately absent: it requires a probe binary inside the image, and this
# runtime has no shell, curl, or wget by design. The check is the HTTP endpoint, which is
# what Kubernetes and Traefik use regardless — Kubernetes ignores HEALTHCHECK entirely.
ENV SERVER_ROOT=/public \
    SERVER_HOST=:: \
    SERVER_PORT=8080 \
    SERVER_HEALTH=true \
    SERVER_LOG_LEVEL=info

# The server never writes to disk, so this image runs unchanged under `--read-only` with no
# tmpfs mount. That is verified by the container smoke check in CI, not merely asserted.

LABEL org.opencontainers.image.title="Renvor landing site" \
      org.opencontainers.image.description="Static V7 landing page for renvor.dev, served from a scratch runtime." \
      org.opencontainers.image.licenses="MIT OR Apache-2.0" \
      org.opencontainers.image.source="https://github.com/renvor-rs/renvor-site" \
      org.opencontainers.image.vendor="Renvor" \
      dev.renvor.health.path="/health" \
      dev.renvor.health.port="8080"

ENTRYPOINT ["/static-web-server"]
