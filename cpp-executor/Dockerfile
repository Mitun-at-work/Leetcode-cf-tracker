FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    g++ \
    cmake \
    libasio-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source files
COPY . .

# Build the application
RUN mkdir build && cd build && cmake .. && make

# Expose port
EXPOSE 8081

# Run the application
CMD ["./build/cpp-executor"]