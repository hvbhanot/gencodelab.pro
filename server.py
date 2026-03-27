from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
import io
import sys
import traceback
import contextlib
import builtins
import hashlib as _hashlib

# Import standard library modules used in problems
import math
import hashlib
import sqlite3
import ast
import threading
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
CORS(app)

# ---------------------------------------------------------------------------
# Database setup - Supports both PostgreSQL (production) and SQLite (local)
# ---------------------------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vibeclub.db")


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
        db.close()


def init_db():
    """Initialize the database with required tables."""
    if USE_POSTGRES:
        conn = psycopg2_module.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                username TEXT NOT NULL,
                problem_id INTEGER NOT NULL,
                best_score INTEGER NOT NULL DEFAULT 0,
                attempts INTEGER NOT NULL DEFAULT 0,
                last_attempt TEXT NOT NULL,
                solved INTEGER NOT NULL DEFAULT 0,
                solution_viewed INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (username, problem_id)
            );
        """)
        conn.commit()
        cursor.close()
        conn.close()
    else:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS progress (
                username TEXT NOT NULL,
                problem_id INTEGER NOT NULL,
                best_score INTEGER NOT NULL DEFAULT 0,
                attempts INTEGER NOT NULL DEFAULT 0,
                last_attempt TEXT NOT NULL,
                solved INTEGER NOT NULL DEFAULT 0,
                solution_viewed INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (username, problem_id)
            );
        """)
        conn.commit()
        conn.close()


def hash_password(password: str) -> str:
    return _hashlib.sha256(password.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Database helper functions for cross-compatibility
# ---------------------------------------------------------------------------

def db_execute(db, query, params=()):
    """Execute a query with proper parameter substitution."""
    if USE_POSTGRES:
        # Convert ? to %s for PostgreSQL
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
        # PostgreSQL returns tuples, need to use index
        if columns and column in columns:
            return row[columns.index(column)]
        # Try common column indices
        col_map = {'username': 0, 'password_hash': 1, 'created_at': 2,
                   'problem_id': 1, 'best_score': 2, 'attempts': 3, 
                   'last_attempt': 4, 'solved': 5, 'solution_viewed': 6}
        if column in col_map:
            return row[col_map[column]]
        return row[0] if len(row) > 0 else None
    else:
        # SQLite supports dictionary-style access
        return row[column]


# ---------------------------------------------------------------------------
# Auth API
# ---------------------------------------------------------------------------


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    if len(username) < 3:
        return jsonify({"success": False, "error": "Username must be at least 3 characters"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    db = get_db()
    existing = db_fetchone(db, "SELECT 1 FROM users WHERE username = ?", (username,))
    if existing:
        return jsonify({"success": False, "error": "Username already exists"}), 409

    cursor = db_execute(db,
        "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
        (username, hash_password(password), time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
    )
    if USE_POSTGRES:
        cursor.close()
    db.commit()
    return jsonify({"success": True, "username": username})


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    db = get_db()
    user = db_fetchone(db, "SELECT * FROM users WHERE username = ?", (username,))

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    if get_row_value(user, "password_hash") != hash_password(password):
        return jsonify({"success": False, "error": "Incorrect password"}), 401

    return jsonify({"success": True, "username": get_row_value(user, "username")})


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
    score = data.get("score", 0)
    solved = data.get("solved", False)
    solution_viewed = data.get("solutionViewed", False)
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
# Code execution
# ---------------------------------------------------------------------------


@app.route("/api/execute", methods=["POST"])
def execute_code():
    try:
        data = request.get_json()
        code = data.get("code", "")

        if not code:
            return jsonify({"output": [], "error": "No code provided"}), 400

        output_buffer = io.StringIO()

        try:
            with contextlib.redirect_stdout(output_buffer):
                safe_builtins = dict(vars(builtins))
                for name in ["exit", "quit", "__loader__", "__spec__"]:
                    safe_builtins.pop(name, None)

                exec_globals = {
                    "__builtins__": safe_builtins,
                    "__name__": "__main__",
                    "math": math,
                    "hashlib": hashlib,
                    "sqlite3": sqlite3,
                    "ast": ast,
                    "threading": threading,
                    "os": os,
                    "itertools": itertools,
                    "asyncio": asyncio,
                    "copy": copy,
                    "dataclasses": dataclasses,
                    "functools": functools,
                    "pickle": pickle,
                    "re": re,
                    "signal": signal,
                    "time": time,
                    "typing": typing,
                    "weakref": weakref,
                    "collections": collections,
                    "json": json_module,
                    "abc": abc,
                }
                if requests_module:
                    exec_globals["requests"] = requests_module
                if bcrypt_module:
                    exec_globals["bcrypt"] = bcrypt_module
                if psycopg2_module:
                    exec_globals["psycopg2"] = psycopg2_module

                exec(code, exec_globals)

            output = output_buffer.getvalue()
            output_lines = output.split("\n") if output else []

            return jsonify({"output": output_lines, "error": None})

        except Exception as e:
            error_message = f"{type(e).__name__}: {str(e)}"
            return jsonify(
                {"output": output_buffer.getvalue().split("\n"), "error": error_message}
            )

    except Exception as e:
        return jsonify({"output": [], "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


# Debug route — check if dist exists on Railway
@app.route("/debug/dist", methods=["GET"])
def debug_dist():
    exists = os.path.isdir(STATIC_DIR)
    files = os.listdir(STATIC_DIR) if exists else []
    cwd = os.getcwd()
    cwd_files = os.listdir(cwd)
    return jsonify({
        "STATIC_DIR": STATIC_DIR,
        "exists": exists,
        "files": files,
        "cwd": cwd,
        "cwd_files": cwd_files,
    })


# Serve React frontend — catch all non-API routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.isfile(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    index = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index):
        return send_from_directory(STATIC_DIR, "index.html")
    return jsonify({"error": "Frontend not built", "dist_path": STATIC_DIR, "exists": os.path.isdir(STATIC_DIR)}), 500


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug, host="0.0.0.0", port=port)
