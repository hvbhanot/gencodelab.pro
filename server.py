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

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
CORS(app)

# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vibeclub.db")


def get_db():
    """Get a per-request database connection stored on Flask's g object."""
    if "db" not in g:
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
# Auth API
# ---------------------------------------------------------------------------


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if len(username) < 3:
        return jsonify({"success": False, "error": "Username must be at least 3 characters"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    db = get_db()
    existing = db.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        return jsonify({"success": False, "error": "Username already exists"}), 409

    db.execute(
        "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
        (username, hash_password(password), time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
    )
    db.commit()
    return jsonify({"success": True, "username": username})


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
    if user["password_hash"] != hash_password(password):
        return jsonify({"success": False, "error": "Incorrect password"}), 401

    return jsonify({"success": True, "username": user["username"]})


# ---------------------------------------------------------------------------
# Progress API
# ---------------------------------------------------------------------------


@app.route("/api/progress/<username>", methods=["GET"])
def get_progress(username):
    db = get_db()
    rows = db.execute("SELECT * FROM progress WHERE username = ?", (username,)).fetchall()

    problems = {}
    for r in rows:
        problems[r["problem_id"]] = {
            "problemId": r["problem_id"],
            "bestScore": r["best_score"],
            "attempts": r["attempts"],
            "lastAttempt": r["last_attempt"],
            "solved": bool(r["solved"]),
            "solutionViewed": bool(r["solution_viewed"]),
        }

    return jsonify({"username": username, "problems": problems})


@app.route("/api/progress/<username>/<int:problem_id>", methods=["POST"])
def update_progress(username, problem_id):
    data = request.get_json()
    score = data.get("score", 0)
    solved = data.get("solved", False)
    solution_viewed = data.get("solutionViewed", False)
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    db = get_db()
    existing = db.execute(
        "SELECT * FROM progress WHERE username = ? AND problem_id = ?",
        (username, problem_id),
    ).fetchone()

    if existing:
        best_score = max(score, existing["best_score"])
        attempts = existing["attempts"] + 1
        is_solved = 1 if (solved or existing["solved"]) else 0
        viewed = 1 if (solution_viewed or existing["solution_viewed"]) else 0
        db.execute(
            """UPDATE progress
               SET best_score = ?, attempts = ?, last_attempt = ?, solved = ?, solution_viewed = ?
               WHERE username = ? AND problem_id = ?""",
            (best_score, attempts, now, is_solved, viewed, username, problem_id),
        )
    else:
        db.execute(
            """INSERT INTO progress (username, problem_id, best_score, attempts, last_attempt, solved, solution_viewed)
               VALUES (?, ?, ?, 1, ?, ?, ?)""",
            (username, problem_id, score, now, 1 if solved else 0, 1 if solution_viewed else 0),
        )

    db.commit()

    row = db.execute(
        "SELECT * FROM progress WHERE username = ? AND problem_id = ?",
        (username, problem_id),
    ).fetchone()

    return jsonify({
        "problemId": row["problem_id"],
        "bestScore": row["best_score"],
        "attempts": row["attempts"],
        "lastAttempt": row["last_attempt"],
        "solved": bool(row["solved"]),
        "solutionViewed": bool(row["solution_viewed"]),
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


# Serve React frontend — catch all non-API routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(STATIC_DIR, path)
    if path and os.path.exists(file_path):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug, host="0.0.0.0", port=port)
