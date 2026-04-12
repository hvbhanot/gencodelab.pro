# gencodelab.pro - Python Code Execution Server

This project now includes a backend server for executing Python code server-side.

## Setup

### Prerequisites
- Node.js and npm
- Python 3.x

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Create a Python virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Application

### Option 1: Run everything together
```bash
npm run dev:all
```
This will start both the Vite frontend (on port 5173) and the Flask backend (on port 8000).

### Option 2: Run separately
Terminal 1 - Start the backend:
```bash
python3 server.py
```

Terminal 2 - Start the frontend:
```bash
npm run dev
```

## Supported Python Libraries

The server supports the following Python standard library modules:
- `math` - Mathematical functions
- `hashlib` - Hashing algorithms (MD5, SHA1, SHA256, etc.)
- `sqlite3` - SQLite database interface
- `ast` - Abstract syntax trees
- `threading` - Thread-based parallelism
- `os` - Operating system interfaces
- `itertools` - Iterator functions
- `asyncio` - Async I/O framework
- `copy` - Shallow and deep copy operations
- `dataclasses` - Data class utilities
- `functools` - Higher-order functions
- `pickle` - Object serialization
- `re` - Regular expressions
- `signal` - Signal handling
- `time` - Time-related functions
- `typing` - Type hints
- `weakref` - Weak references

And the following external packages:
- `requests` - HTTP library
- `bcrypt` - Password hashing
- `psycopg2` - PostgreSQL database adapter

## Server API

### POST /api/execute
Executes Python code and returns the output.

Request body:
```json
{
  "code": "print('Hello, World!')"
}
```

Response:
```json
{
  "output": ["Hello, World!"],
  "error": null
}
```

### GET /health
Health check endpoint.

## How It Works

1. The frontend sends Python code to the Flask server
2. The server executes the code in a controlled environment
3. The server captures stdout and returns the output
4. The frontend displays the results in the terminal panel

## Security Notes

- The server restricts available built-in functions for safety
- Code execution is isolated using Python's `exec()` with restricted globals
- Standard library modules are pre-imported and available for use
- `__import__` is available but only imports pre-approved modules
- External packages (requests, bcrypt, psycopg2) are loaded on-demand
- No filesystem access, no network operations, no subprocess execution
- Designed for educational debugging scenarios, not general-purpose code execution