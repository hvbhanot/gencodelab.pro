# Python Library Support - Complete List

This document lists all Python libraries and modules supported by the gencodelab.pro code execution server.

## Standard Library Modules (Pre-imported)

The following Python standard library modules are pre-imported and available in the code execution environment:

| Module | Description | Common Functions Used |
|---------|-------------|----------------------|
| `math` | Mathematical functions | sqrt(), sin(), cos(), log(), factorial(), etc. |
| `hashlib` | Hashing algorithms | md5(), sha1(), sha256(), etc. |
| `sqlite3` | SQLite database interface | connect(), cursor(), execute() |
| `ast` | Abstract syntax trees | literal_eval(), parse() |
| `threading` | Thread-based parallelism | Thread(), Lock(), Event() |
| `os` | Operating system interfaces | path, environ, system() (read-only) |
| `itertools` | Iterator functions | islice(), chain(), combinations() |
| `asyncio` | Async I/O framework | async/await, run(), gather() |
| `copy` | Shallow and deep copy operations | copy(), deepcopy() |
| `dataclasses` | Data class utilities | dataclass(), field() |
| `functools` | Higher-order functions | lru_cache(), partial(), reduce() |
| `pickle` | Object serialization | dumps(), loads() |
| `re` | Regular expressions | match(), search(), sub() |
| `signal` | Signal handling | signal(), alarm() |
| `time` | Time-related functions | sleep(), time(), perf_counter() |
| `typing` | Type hints | List, Dict, Optional, Union |
| `weakref` | Weak references | ref(), WeakValueDictionary |

## External Packages (Load-on-demand)

The following external packages are installed and can be imported:

| Package | Description | Version |
|---------|-------------|----------|
| `requests` | HTTP library for making requests | >= 2.31.0 |
| `bcrypt` | Password hashing library | >= 4.1.0 |
| `psycopg2` | PostgreSQL database adapter | >= 2.9.0 |

## Built-in Functions Available

The following built-in functions are available in the `__builtins__` dictionary:

| Function | Description | Example |
|----------|-------------|----------|
| `print()` | Output to stdout | print("Hello") |
| `len()` | Get length | len([1, 2, 3]) |
| `str()` | Convert to string | str(123) |
| `int()` | Convert to integer | int("123") |
| `float()` | Convert to float | float("3.14") |
| `sum()` | Sum of iterable | sum([1, 2, 3]) |
| `max()` | Maximum value | max([1, 5, 3]) |
| `min()` | Minimum value | min([1, 5, 3]) |
| `range()` | Generate range | range(10) |
| `list()` | Create list | list(range(5)) |
| `set()` | Create set | set([1, 2, 3]) |
| `sorted()` | Sort iterable | sorted([3, 1, 2]) |
| `abs()` | Absolute value | abs(-5) |
| `round()` | Round number | round(3.14) |
| `pow()` | Power function | pow(2, 10) |
| `True` | Boolean true | if condition |
| `False` | Boolean false | if not condition |
| `None` | None value | return None |
| `__import__` | Import modules | import hashlib |

## What's NOT Available

For security reasons, the following are **NOT** available:

- Filesystem operations (beyond read-only)
- Network operations (requests/urllib available but network disabled)
- Subprocess execution
- `open()` for writing files
- `os.system()` or similar shell commands
- `eval()` or dangerous operations

## Example Usage

```python
import hashlib
import math
import re

# Hash a string
hash = hashlib.md5(b"password").hexdigest()
print(f"Hash: {hash}")

# Mathematical operations
result = math.sqrt(16)
print(f"Square root: {result}")

# Regular expressions
matches = re.findall(r'\d+', 'test123')
print(f"Matches: {matches}")
```

All of these work correctly in the gencodelab.pro code execution server!