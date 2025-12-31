# because of dotnet, we always build on amd64, and target platforms in cli
# dotnet doesn't support QEMU for building or running in some cases
# hadolint ignore=DL3029
# to build for a different platform: docker buildx build --platform <platform>

# Build stage: Use builder's platform for native SDK, cross-compile to target
FROM --platform=${BUILDPLATFORM} mcr.microsoft.com/dotnet/sdk:7.0 AS build
ARG TARGETPLATFORM
ARG TARGETARCH
ARG BUILDPLATFORM
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"

WORKDIR /source

# Copy csproj and restore (cached layer)
COPY *.csproj .
RUN dotnet restore -a $TARGETARCH

# Copy source and publish
COPY . .
RUN dotnet publish -c release -o /app -a $TARGETARCH --self-contained false --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/runtime:7.0 AS final

# Install curl for potential healthcheck/debugging
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app .

# Create non-root user (best practice security)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port kalau nanti ditambahin endpoint (opsional, worker biasanya gak perlu)
# EXPOSE 80

# Simple healthcheck: cek kalau process dotnet hidup (via pid 1 check)
# Alternatif: HEALTHCHECK CMD ["true"] kalau mau minimal
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pgrep dotnet || exit 1

ENTRYPOINT ["dotnet", "Worker.dll"]