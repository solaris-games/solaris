FROM rust:1.94-slim-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
# Create dummy main to cache dependency builds
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true
# Now copy real source and build
COPY src/ src/
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/solaris-archive /usr/local/bin/
EXPOSE 3001
CMD ["solaris-archive"]
