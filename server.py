from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
import io
import sys
import traceback as traceback_module
import contextlib
import builtins
import hashlib as _hashlib
import hmac
import random
import string
import threading

# Import standard library modules used in problems
import math
import hashlib
import sqlite3
import ast
import os
import itertools
import asyncio
import copy
import dataclasses
import functools
import pickle
import re
import signal
import time
import typing
import weakref
import collections
import json as json_module
import abc

# Safely import optional external packages
try:
    import requests as requests_module
except ImportError:
    requests_module = None

try:
    import bcrypt as bcrypt_module
except ImportError:
    bcrypt_module = None

try:
    import psycopg2 as psycopg2_module
except ImportError:
    psycopg2_module = None

# Database configuration - use PostgreSQL if available, else SQLite
DATABASE_URL = os.environ.get('DATABASE_URL')
USE_POSTGRES = DATABASE_URL and psycopg2_module is not None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "dist")

app = Flask(__name__, static_folder=None)

# ---------------------------------------------------------------------------
# CORS - restrict to known origins in production
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:8000').split(',')
CORS(app, origins=ALLOWED_ORIGINS)

# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    if os.environ.get('FLASK_ENV') == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# ---------------------------------------------------------------------------
# Request size limit
# ---------------------------------------------------------------------------
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # 1MB max request body

# ---------------------------------------------------------------------------
# Email domain restriction
# ---------------------------------------------------------------------------
ALLOWED_EMAIL_DOMAINS = ['islander.tamucc.edu', 'tamucc.edu']

# ---------------------------------------------------------------------------
# Code execution limits
# ---------------------------------------------------------------------------
MAX_CODE_LENGTH = 50000  # 50KB max code submission
EXEC_TIMEOUT_SECONDS = 10

# ---------------------------------------------------------------------------
# Database setup - Supports both PostgreSQL (production) and SQLite (local)
# ---------------------------------------------------------------------------
DB_PATH = os.path.join(BASE_DIR, "gencodelab.db")


def get_db():
    """Get a per-request database connection stored on Flask's g object."""
    if "db" not in g:
        if USE_POSTGRES:
            g.db = psycopg2_module.connect(DATABASE_URL)
        else:
            g.db = sqlite3.connect(DB_PATH, timeout=10)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA journal_mode=WAL")
    return g.db


@app.teardown_appcontext
def close_db(exception):
    """Automatically close the DB connection when the request ends."""
    db = g.pop("db", None)
    if db is not None:
        if exception:
            try:
                db.rollback()
            except Exception:
                pass
        db.close()


def init_db():
    """Initialize the database with required tables."""
    tables_sql = [
        """CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );""",
        """CREATE TABLE IF NOT EXISTS progress (
            username TEXT NOT NULL,
            problem_id INTEGER NOT NULL,
            best_score INTEGER NOT NULL DEFAULT 0,
            attempts INTEGER NOT NULL DEFAULT 0,
            last_attempt TEXT NOT NULL,
            solved INTEGER NOT NULL DEFAULT 0,
            solution_viewed INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (username, problem_id)
        );""",
        """CREATE TABLE IF NOT EXISTS streaks (
            username TEXT PRIMARY KEY,
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            last_solve_date TEXT NOT NULL DEFAULT ''
        );""",
        """CREATE TABLE IF NOT EXISTS bookmarks (
            username TEXT NOT NULL,
            problem_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (username, problem_id)
        );""",
        """CREATE TABLE IF NOT EXISTS invites (
            code TEXT PRIMARY KEY,
            inviter TEXT NOT NULL,
            invitee TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            used_at TEXT DEFAULT ''
        );""",
    ]
    if USE_POSTGRES:
        conn = psycopg2_module.connect(DATABASE_URL)
        cursor = conn.cursor()
        for sql in tables_sql:
            cursor.execute(sql)
        conn.commit()
        cursor.close()
        conn.close()
    else:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        conn.executescript("\n".join(tables_sql))
        conn.commit()
        conn.close()


# ---------------------------------------------------------------------------
# Password hashing - use bcrypt if available, else SHA-256 with salt
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    if bcrypt_module:
        return bcrypt_module.hashpw(password.encode(), bcrypt_module.gensalt()).decode()
    return _hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, stored_hash: str) -> bool:
    if bcrypt_module:
        try:
            return bcrypt_module.checkpw(password.encode(), stored_hash.encode())
        except Exception:
            return False
    return hmac.compare_digest(
        _hashlib.sha256(password.encode()).hexdigest(),
        stored_hash
    )


# ---------------------------------------------------------------------------
# Database helper functions for cross-compatibility
# ---------------------------------------------------------------------------

def db_execute(db, query, params=()):
    """Execute a query with proper parameter substitution."""
    if USE_POSTGRES:
        query = query.replace("?", "%s")
        cursor = db.cursor()
        cursor.execute(query, params)
        return cursor
    else:
        return db.execute(query, params)


def db_fetchone(db, query, params=()):
    """Fetch one row from the database."""
    cursor = db_execute(db, query, params)
    row = cursor.fetchone()
    if USE_POSTGRES and cursor:
        cursor.close()
    return row


def db_fetchall(db, query, params=()):
    """Fetch all rows from the database."""
    cursor = db_execute(db, query, params)
    rows = cursor.fetchall()
    if USE_POSTGRES and cursor:
        cursor.close()
    return rows


def get_row_value(row, column, columns=None):
    """Get a value from a row (handles both SQLite and PostgreSQL)."""
    if row is None:
        return None
    if USE_POSTGRES:
        if columns and column in columns:
            return row[columns.index(column)]
        col_map = {'username': 0, 'email': 1, 'password_hash': 2, 'created_at': 3,
                   'problem_id': 1, 'best_score': 2, 'attempts': 3,
                   'last_attempt': 4, 'solved': 5, 'solution_viewed': 6}
        if column in col_map:
            return row[col_map[column]]
        return row[0] if len(row) > 0 else None
    else:
        return row[column]


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

USERNAME_RE = re.compile(r'^[a-zA-Z0-9_]{3,30}$')


def _is_allowed_email(email):
    return any(email.endswith(f"@{d}") for d in ALLOWED_EMAIL_DOMAINS)


# ---------------------------------------------------------------------------
# Auth API
# ---------------------------------------------------------------------------


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400

    username = data.get("username", "").strip().lower()
    password = data.get("password", "")
    email = data.get("email", "").strip().lower()

    if not USERNAME_RE.match(username):
        return jsonify({"success": False, "error": "Username must be 3-30 characters (letters, numbers, underscores only)"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400
    if not email or not _is_allowed_email(email):
        return jsonify({"success": False, "error": "Only @islander.tamucc.edu and @tamucc.edu emails are allowed"}), 400

    db = get_db()
    existing = db_fetchone(db, "SELECT 1 FROM users WHERE username = ?", (username,))
    if existing:
        return jsonify({"success": False, "error": "Username already exists"}), 409

    existing_email = db_fetchone(db, "SELECT 1 FROM users WHERE email = ?", (email,))
    if existing_email:
        return jsonify({"success": False, "error": "This email is already registered"}), 409

    cursor = db_execute(db,
        "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (username, email, hash_password(password), time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
    )
    if USE_POSTGRES:
        cursor.close()
    db.commit()

    return jsonify({"success": True, "username": username})


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400

    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    db = get_db()
    user = db_fetchone(db, "SELECT * FROM users WHERE username = ?", (username,))

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    if not verify_password(password, get_row_value(user, "password_hash")):
        return jsonify({"success": False, "error": "Incorrect password"}), 401

    return jsonify({"success": True, "username": get_row_value(user, "username")})


@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    """Reset password by verifying email ownership."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400

    email = data.get("email", "").strip().lower()
    new_password = data.get("newPassword", "")

    if not email or not _is_allowed_email(email):
        return jsonify({"success": False, "error": "Invalid email"}), 400
    if len(new_password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    db = get_db()
    user = db_fetchone(db, "SELECT * FROM users WHERE email = ?", (email,))
    if not user:
        return jsonify({"success": False, "error": "No account found with this email"}), 404

    cursor = db_execute(db,
        "UPDATE users SET password_hash = ? WHERE email = ?",
        (hash_password(new_password), email))
    if USE_POSTGRES:
        cursor.close()
    db.commit()

    return jsonify({"success": True})


# ---------------------------------------------------------------------------
# Bookmarks API
# ---------------------------------------------------------------------------


@app.route("/api/bookmarks/<username>", methods=["GET"])
def get_bookmarks(username):
    username = username.lower()
    db = get_db()
    rows = db_fetchall(db, "SELECT problem_id FROM bookmarks WHERE username = ?", (username,))
    ids = [get_row_value(r, "problem_id") if not USE_POSTGRES else r[0] for r in rows]
    return jsonify({"bookmarks": ids})


@app.route("/api/bookmarks/<username>/<int:problem_id>", methods=["POST"])
def toggle_bookmark(username, problem_id):
    username = username.lower()
    db = get_db()
    existing = db_fetchone(db,
        "SELECT 1 FROM bookmarks WHERE username = ? AND problem_id = ?",
        (username, problem_id))

    if existing:
        cursor = db_execute(db,
            "DELETE FROM bookmarks WHERE username = ? AND problem_id = ?",
            (username, problem_id))
        if USE_POSTGRES:
            cursor.close()
        db.commit()
        return jsonify({"bookmarked": False})
    else:
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        cursor = db_execute(db,
            "INSERT INTO bookmarks (username, problem_id, created_at) VALUES (?, ?, ?)",
            (username, problem_id, now))
        if USE_POSTGRES:
            cursor.close()
        db.commit()
        return jsonify({"bookmarked": True})


# ---------------------------------------------------------------------------
# Public Profile API
# ---------------------------------------------------------------------------


@app.route("/api/profile/<username>", methods=["GET"])
def get_public_profile(username):
    """Public profile data for any user."""
    username = username.lower()
    db = get_db()

    user = db_fetchone(db, "SELECT username, created_at FROM users WHERE username = ?", (username,))
    if not user:
        return jsonify({"error": "User not found"}), 404

    uname = get_row_value(user, "username") if not USE_POSTGRES else user[0]
    created = get_row_value(user, "created_at") if not USE_POSTGRES else user[1]

    # Progress stats
    rows = db_fetchall(db, "SELECT * FROM progress WHERE username = ?", (username,))
    problems = {}
    for r in rows:
        problems[get_row_value(r, "problem_id") if not USE_POSTGRES else r[1]] = {
            "problemId": get_row_value(r, "problem_id") if not USE_POSTGRES else r[1],
            "bestScore": get_row_value(r, "best_score") if not USE_POSTGRES else r[2],
            "attempts": get_row_value(r, "attempts") if not USE_POSTGRES else r[3],
            "lastAttempt": get_row_value(r, "last_attempt") if not USE_POSTGRES else r[4],
            "solved": bool(get_row_value(r, "solved") if not USE_POSTGRES else r[5]),
        }

    # Streak
    streak_row = db_fetchone(db, "SELECT * FROM streaks WHERE username = ?", (username,))
    streak = {
        "currentStreak": (get_row_value(streak_row, "current_streak") if not USE_POSTGRES else streak_row[1]) if streak_row else 0,
        "longestStreak": (get_row_value(streak_row, "longest_streak") if not USE_POSTGRES else streak_row[2]) if streak_row else 0,
    }

    # Invite stats
    invited_count = db_fetchone(db, "SELECT COUNT(*) FROM invites WHERE inviter = ? AND invitee != ''", (username,))
    invited_by = db_fetchone(db, "SELECT inviter FROM invites WHERE invitee = ?", (username,))

    return jsonify({
        "username": uname,
        "createdAt": created,
        "problems": problems,
        "streak": streak,
        "invitedCount": (invited_count[0] if invited_count else 0),
        "invitedBy": ((get_row_value(invited_by, "inviter") if not USE_POSTGRES else invited_by[0]) if invited_by else None),
    })


# ---------------------------------------------------------------------------
# Invite API
# ---------------------------------------------------------------------------


@app.route("/api/invite/generate", methods=["POST"])
def generate_invite():
    """Generate a unique invite code for a user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    username = data.get("username", "").strip().lower()
    if not username:
        return jsonify({"error": "Username required"}), 400

    db = get_db()
    # Check if user already has an unused invite
    existing = db_fetchone(db, "SELECT code FROM invites WHERE inviter = ? AND invitee = ''", (username,))
    if existing:
        code = get_row_value(existing, "code") if not USE_POSTGRES else existing[0]
        return jsonify({"code": code})

    # Generate new code
    code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cursor = db_execute(db,
        "INSERT INTO invites (code, inviter, invitee, created_at, used_at) VALUES (?, ?, '', ?, '')",
        (code, username, now))
    if USE_POSTGRES:
        cursor.close()
    db.commit()

    return jsonify({"code": code})


@app.route("/api/invite/<code>", methods=["GET"])
def check_invite(code):
    """Check if an invite code is valid."""
    db = get_db()
    row = db_fetchone(db, "SELECT * FROM invites WHERE code = ?", (code,))
    if not row:
        return jsonify({"valid": False, "error": "Invalid invite code"}), 404

    invitee = get_row_value(row, "invitee") if not USE_POSTGRES else row[2]
    inviter = get_row_value(row, "inviter") if not USE_POSTGRES else row[1]

    if invitee:
        return jsonify({"valid": False, "error": "Invite already used"})

    return jsonify({"valid": True, "inviter": inviter})


@app.route("/api/invite/use", methods=["POST"])
def use_invite():
    """Mark an invite as used by a new user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    code = data.get("code", "").strip()
    invitee = data.get("username", "").strip().lower()

    if not code or not invitee:
        return jsonify({"error": "Code and username required"}), 400

    db = get_db()
    row = db_fetchone(db, "SELECT * FROM invites WHERE code = ? AND invitee = ''", (code,))
    if not row:
        return jsonify({"error": "Invalid or used invite code"}), 400

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cursor = db_execute(db,
        "UPDATE invites SET invitee = ?, used_at = ? WHERE code = ?",
        (invitee, now, code))
    if USE_POSTGRES:
        cursor.close()
    db.commit()

    inviter = get_row_value(row, "inviter") if not USE_POSTGRES else row[1]
    return jsonify({"success": True, "inviter": inviter})


@app.route("/api/invite/stats/<username>", methods=["GET"])
def invite_stats(username):
    """Get invite stats for a user."""
    username = username.lower()
    db = get_db()

    # Get their active invite code
    active = db_fetchone(db, "SELECT code FROM invites WHERE inviter = ? AND invitee = ''", (username,))
    active_code = (get_row_value(active, "code") if not USE_POSTGRES else active[0]) if active else None

    # Count successful invites
    count_row = db_fetchone(db, "SELECT COUNT(*) FROM invites WHERE inviter = ? AND invitee != ''", (username,))
    count = count_row[0] if count_row else 0

    # Who invited them
    invited_by = db_fetchone(db, "SELECT inviter FROM invites WHERE invitee = ?", (username,))
    inviter = (get_row_value(invited_by, "inviter") if not USE_POSTGRES else invited_by[0]) if invited_by else None

    return jsonify({"activeCode": active_code, "invitedCount": count, "invitedBy": inviter})


# ---------------------------------------------------------------------------
# Progress API
# ---------------------------------------------------------------------------


@app.route("/api/progress/<username>", methods=["GET"])
def get_progress(username):
    username = username.lower()
    db = get_db()
    rows = db_fetchall(db, "SELECT * FROM progress WHERE username = ?", (username,))

    problems = {}
    for r in rows:
        problems[get_row_value(r, "problem_id")] = {
            "problemId": get_row_value(r, "problem_id"),
            "bestScore": get_row_value(r, "best_score"),
            "attempts": get_row_value(r, "attempts"),
            "lastAttempt": get_row_value(r, "last_attempt"),
            "solved": bool(get_row_value(r, "solved")),
            "solutionViewed": bool(get_row_value(r, "solution_viewed")),
        }

    return jsonify({"username": username, "problems": problems})


@app.route("/api/progress/<username>/<int:problem_id>", methods=["POST"])
def update_progress(username, problem_id):
    username = username.lower()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    score = data.get("score", 0)
    solved = data.get("solved", False)
    solution_viewed = data.get("solutionViewed", False)

    if not isinstance(score, (int, float)) or score < 0:
        return jsonify({"error": "Invalid score"}), 400

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    db = get_db()
    existing = db_fetchone(
        db,
        "SELECT * FROM progress WHERE username = ? AND problem_id = ?",
        (username, problem_id),
    )

    if existing:
        best_score = max(score, get_row_value(existing, "best_score"))
        attempts = get_row_value(existing, "attempts") + 1
        is_solved = 1 if (solved or get_row_value(existing, "solved")) else 0
        viewed = 1 if (solution_viewed or get_row_value(existing, "solution_viewed")) else 0
        cursor = db_execute(db,
            """UPDATE progress
               SET best_score = ?, attempts = ?, last_attempt = ?, solved = ?, solution_viewed = ?
               WHERE username = ? AND problem_id = ?""",
            (best_score, attempts, now, is_solved, viewed, username, problem_id),
        )
        if USE_POSTGRES:
            cursor.close()
    else:
        cursor = db_execute(db,
            """INSERT INTO progress (username, problem_id, best_score, attempts, last_attempt, solved, solution_viewed)
               VALUES (?, ?, ?, 1, ?, ?, ?)""",
            (username, problem_id, score, now, 1 if solved else 0, 1 if solution_viewed else 0),
        )
        if USE_POSTGRES:
            cursor.close()

    # Update streak if problem was solved
    if solved:
        _update_streak(db, username)

    db.commit()

    row = db_fetchone(db,
        "SELECT * FROM progress WHERE username = ? AND problem_id = ?",
        (username, problem_id),
    )

    return jsonify({
        "problemId": get_row_value(row, "problem_id"),
        "bestScore": get_row_value(row, "best_score"),
        "attempts": get_row_value(row, "attempts"),
        "lastAttempt": get_row_value(row, "last_attempt"),
        "solved": bool(get_row_value(row, "solved")),
        "solutionViewed": bool(get_row_value(row, "solution_viewed")),
    })


# ---------------------------------------------------------------------------
# Sandboxed code execution helpers
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Leaderboard API
# ---------------------------------------------------------------------------


@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    db = get_db()
    rows = db_fetchall(db,
        """SELECT p.username, SUM(p.best_score) as total_score,
                  COUNT(CASE WHEN p.solved = 1 THEN 1 END) as solved_count
           FROM progress p
           INNER JOIN users u ON p.username = u.username
           GROUP BY p.username ORDER BY total_score DESC LIMIT 50""")

    leaderboard = []
    for i, r in enumerate(rows):
        leaderboard.append({
            "rank": i + 1,
            "username": get_row_value(r, "username") if not USE_POSTGRES else r[0],
            "totalScore": (get_row_value(r, "total_score") if not USE_POSTGRES else r[1]) or 0,
            "solvedCount": (get_row_value(r, "solved_count") if not USE_POSTGRES else r[2]) or 0,
        })

    return jsonify({"leaderboard": leaderboard})


# ---------------------------------------------------------------------------
# Streaks API
# ---------------------------------------------------------------------------


def _update_streak(db, username):
    """Update a user's streak after solving a problem."""
    today = time.strftime("%Y-%m-%d", time.gmtime())
    row = db_fetchone(db, "SELECT * FROM streaks WHERE username = ?", (username,))

    if not row:
        cursor = db_execute(db,
            "INSERT INTO streaks (username, current_streak, longest_streak, last_solve_date) VALUES (?, 1, 1, ?)",
            (username, today))
        if USE_POSTGRES:
            cursor.close()
        return

    last_date = get_row_value(row, "last_solve_date") if not USE_POSTGRES else row[3]
    current = (get_row_value(row, "current_streak") if not USE_POSTGRES else row[1]) or 0
    longest = (get_row_value(row, "longest_streak") if not USE_POSTGRES else row[2]) or 0

    if last_date == today:
        return  # Already counted today

    # Check if yesterday
    import datetime
    try:
        last = datetime.date.fromisoformat(last_date)
        diff = (datetime.date.fromisoformat(today) - last).days
    except (ValueError, TypeError):
        diff = 999

    if diff == 1:
        current += 1
    elif diff > 1:
        current = 1

    longest = max(longest, current)

    cursor = db_execute(db,
        "UPDATE streaks SET current_streak = ?, longest_streak = ?, last_solve_date = ? WHERE username = ?",
        (current, longest, today, username))
    if USE_POSTGRES:
        cursor.close()


@app.route("/api/streaks/<username>", methods=["GET"])
def get_streaks(username):
    username = username.lower()
    db = get_db()
    row = db_fetchone(db, "SELECT * FROM streaks WHERE username = ?", (username,))

    if not row:
        return jsonify({"currentStreak": 0, "longestStreak": 0, "lastSolveDate": ""})

    return jsonify({
        "currentStreak": (get_row_value(row, "current_streak") if not USE_POSTGRES else row[1]) or 0,
        "longestStreak": (get_row_value(row, "longest_streak") if not USE_POSTGRES else row[2]) or 0,
        "lastSolveDate": (get_row_value(row, "last_solve_date") if not USE_POSTGRES else row[3]) or "",
    })


# ---------------------------------------------------------------------------
# Daily Challenge API
# ---------------------------------------------------------------------------


@app.route("/api/daily", methods=["GET"])
def get_daily_challenge():
    """Return a deterministic daily problem based on the date."""
    today = time.strftime("%Y-%m-%d", time.gmtime())
    # Use date as seed for deterministic selection
    import hashlib as hl
    seed = int(hl.md5(today.encode()).hexdigest(), 16)
    # We don't know total problems here, return the seed-based ID
    # Frontend will use: problems[seed % problems.length]
    return jsonify({"date": today, "seed": seed})


# ---------------------------------------------------------------------------
# Sandboxed code execution helpers
# ---------------------------------------------------------------------------

ALLOWED_MODULES = {
    "math": math,
    "hashlib": hashlib,
    "ast": ast,
    "itertools": itertools,
    "copy": copy,
    "dataclasses": dataclasses,
    "functools": functools,
    "re": re,
    "time": time,
    "typing": typing,
    "weakref": weakref,
    "collections": collections,
    "json": json_module,
    "abc": abc,
    "threading": threading,
    "asyncio": asyncio,
    "pickle": pickle,
    "signal": signal,
    "os": os,
    "sqlite3": sqlite3,
    "random": random,
    "string": string,
    "io": io,
    "sys": sys,
}

if requests_module:
    ALLOWED_MODULES["requests"] = requests_module
if bcrypt_module:
    ALLOWED_MODULES["bcrypt"] = bcrypt_module
if psycopg2_module:
    ALLOWED_MODULES["psycopg2"] = psycopg2_module


def _safe_import(name, *args, **kwargs):
    """Only allow importing whitelisted modules."""
    if name in ALLOWED_MODULES:
        return ALLOWED_MODULES[name]
    raise ImportError(f"Module '{name}' is not available in the sandbox")


def _build_safe_globals():
    """Build a restricted globals dict for sandboxed code execution."""
    safe_builtins = dict(vars(builtins))
    for name in ["exit", "quit", "__loader__", "__spec__",
                 "open", "exec", "eval", "compile",
                 "input", "breakpoint"]:
        safe_builtins.pop(name, None)
    # Replace __import__ with a restricted version
    safe_builtins["__import__"] = _safe_import

    exec_globals = {
        "__builtins__": safe_builtins,
        "__name__": "__main__",
    }
    # Pre-inject all allowed modules so code can use them without import
    exec_globals.update(ALLOWED_MODULES)
    return exec_globals


class CodeExecutionTimeout(Exception):
    pass


def _exec_with_timeout(code, exec_globals, timeout, output_buffer=None):
    """Execute code with a timeout using a thread.

    If output_buffer is provided, stdout is redirected inside the thread
    so that print() output is captured correctly.
    """
    result = {"error": None, "traceback": None}

    def target():
        try:
            if output_buffer is not None:
                with contextlib.redirect_stdout(output_buffer):
                    exec(code, exec_globals)
            else:
                exec(code, exec_globals)
        except Exception as e:
            result["error"] = e
            result["traceback"] = traceback_module.format_exc()

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    thread.join(timeout)

    if thread.is_alive():
        raise CodeExecutionTimeout(f"Code execution timed out after {timeout} seconds")

    if result["error"] is not None:
        raise result["error"]


# ---------------------------------------------------------------------------
# Code execution endpoints
# ---------------------------------------------------------------------------


@app.route("/api/execute", methods=["POST"])
def execute_code():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"output": [], "error": "Invalid request body"}), 400

        code = data.get("code", "")

        if not code:
            return jsonify({"output": [], "error": "No code provided"}), 400

        if len(code) > MAX_CODE_LENGTH:
            return jsonify({"output": [], "error": f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters"}), 400

        output_buffer = io.StringIO()

        try:
            exec_globals = _build_safe_globals()
            _exec_with_timeout(code, exec_globals, EXEC_TIMEOUT_SECONDS, output_buffer)

            output = output_buffer.getvalue()
            output_lines = output.split("\n") if output else []

            return jsonify({"output": output_lines, "error": None})

        except CodeExecutionTimeout as e:
            return jsonify({
                "output": output_buffer.getvalue().split("\n"),
                "error": str(e),
            })

        except Exception as e:
            tb = traceback_module.format_exc()
            # Extract only the relevant part of the traceback (skip exec internals)
            tb_lines = tb.strip().split("\n")
            # Filter out internal frames, keep user-relevant lines
            user_tb = []
            for line in tb_lines:
                if '<string>' in line or not line.startswith('  File "'):
                    user_tb.append(line)
                elif line.startswith('Traceback'):
                    user_tb.append(line)
                elif not any(internal in line for internal in ['server.py', 'contextlib', 'threading']):
                    user_tb.append(line)
            error_message = "\n".join(user_tb) if user_tb else f"{type(e).__name__}: {str(e)}"
            return jsonify(
                {"output": output_buffer.getvalue().split("\n"), "error": error_message}
            )

    except Exception:
        return jsonify({"output": [], "error": "Internal server error"}), 500


@app.route("/api/test", methods=["POST"])
def run_tests():
    """Run user code against multiple test cases for recall mode."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"results": [], "error": "Invalid request body"}), 400

        code = data.get("code", "")
        test_cases = data.get("testCases", [])

        if not code:
            return jsonify({"results": [], "error": "No code provided"}), 400
        if not test_cases:
            return jsonify({"results": [], "error": "No test cases provided"}), 400
        if len(code) > MAX_CODE_LENGTH:
            return jsonify({"results": [], "error": f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters"}), 400

        results = []
        for tc in test_cases:
            tc_id = tc.get("id", 0)
            tc_input = tc.get("input", "")
            tc_expected = tc.get("expectedOutput", "").strip()

            full_code = code + "\n" + tc_input
            output_buffer = io.StringIO()

            try:
                exec_globals = _build_safe_globals()
                _exec_with_timeout(full_code, exec_globals, EXEC_TIMEOUT_SECONDS, output_buffer)

                actual = output_buffer.getvalue().strip()
                passed = actual == tc_expected
                results.append({
                    "id": tc_id,
                    "passed": passed,
                    "actual": actual,
                    "expected": tc_expected,
                    "error": None,
                })
            except CodeExecutionTimeout as e:
                results.append({
                    "id": tc_id,
                    "passed": False,
                    "actual": output_buffer.getvalue().strip(),
                    "expected": tc_expected,
                    "error": str(e),
                })
            except Exception as e:
                tb = traceback_module.format_exc()
                tb_lines = tb.strip().split("\n")
                user_tb = []
                for line in tb_lines:
                    if '<string>' in line or not line.startswith('  File "'):
                        user_tb.append(line)
                    elif line.startswith('Traceback'):
                        user_tb.append(line)
                    elif not any(internal in line for internal in ['server.py', 'contextlib', 'threading']):
                        user_tb.append(line)
                error_msg = "\n".join(user_tb) if user_tb else f"{type(e).__name__}: {str(e)}"
                results.append({
                    "id": tc_id,
                    "passed": False,
                    "actual": output_buffer.getvalue().strip(),
                    "expected": tc_expected,
                    "error": error_msg,
                })

        return jsonify({"results": results, "error": None})

    except Exception:
        return jsonify({"results": [], "error": "Internal server error"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


# Serve React frontend — catch all non-API routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.isfile(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    index = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index):
        return send_from_directory(STATIC_DIR, "index.html")
    return jsonify({"error": "Frontend not built"}), 500


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug, host="0.0.0.0", port=port)
