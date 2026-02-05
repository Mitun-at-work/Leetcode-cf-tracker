# C++ Code Executor Service

A C++ HTTP service that compiles and executes C++ code safely with timeouts and resource limits.

## Features

- REST API for compiling and running C++ code
- Timeout protection (10s compilation, 15s execution)
- Isolated execution in temporary directories
- JSON API responses
- Health check endpoint

## API Endpoints

### POST /execute

Execute C++ code.

**Request Body:**

```json
{
  "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}"
}
```

**Response:**

```json
{
  "output": "Hello, World!\n",
  "success": true
}
```

### GET /health

Health check endpoint.

**Response:** `OK`

## Building and Running

### Local Build

```bash
mkdir build
cd build
cmake ..
make
./cpp-executor
```

### Docker

```bash
docker-compose up --build
```

### Manual Docker Build

```bash
docker build -t cpp-executor .
docker run -p 8081:8081 cpp-executor
```

## Security Features

- Code execution in isolated temporary directories
- Timeout limits prevent infinite loops
- No network access during execution
- Read-only filesystem (in Docker)

## Dependencies

- C++17 compiler (g++)
- CMake
- ASIO library
- Crow HTTP library (header-only)
