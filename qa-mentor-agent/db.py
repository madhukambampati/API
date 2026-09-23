"""MongoDB-backed accounts and cross-device sync.

Entirely optional: every function here degrades gracefully to a no-op
when MONGODB_URI isn't set. pymongo is only imported lazily, inside
get_db(), so a broken/missing pymongo install can never crash the rest
of the app when accounts aren't configured.
"""

import os
import time

from werkzeug.security import check_password_hash, generate_password_hash

MONGODB_URI = os.environ.get("MONGODB_URI")

_client = None
_db = None


def get_db():
    global _client, _db
    if not MONGODB_URI:
        return None
    if _db is None:
        try:
            from pymongo import MongoClient

            _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            _db = _client.get_default_database()
            _db.users.create_index("email", unique=True)
        except Exception:
            _client = None
            _db = None
    return _db


def accounts_enabled():
    return bool(MONGODB_URI)


def create_user(email, password):
    database = get_db()
    if database is None:
        return None, "Accounts aren't available right now."
    email = email.strip().lower()
    if not email or "@" not in email:
        return None, "Enter a valid email address."
    if len(password) < 8:
        return None, "Password must be at least 8 characters."
    if database.users.find_one({"email": email}):
        return None, "An account with that email already exists."
    user = {
        "email": email,
        "password_hash": generate_password_hash(password),
        "created_at": time.time(),
        "data": {},
    }
    try:
        result = database.users.insert_one(user)
    except Exception:
        return None, "Couldn't create your account right now. Try again shortly."
    user["_id"] = result.inserted_id
    return user, None


def verify_user(email, password):
    database = get_db()
    if database is None:
        return None
    email = email.strip().lower()
    try:
        user = database.users.find_one({"email": email})
    except Exception:
        return None
    if not user or not check_password_hash(user["password_hash"], password):
        return None
    return user


def get_user_by_id(user_id):
    database = get_db()
    if database is None:
        return None
    try:
        from bson import ObjectId

        return database.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def get_user_data(user_id):
    user = get_user_by_id(user_id)
    return user.get("data", {}) if user else {}


def save_user_data(user_id, data):
    database = get_db()
    if database is None:
        return False
    try:
        from bson import ObjectId

        database.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"data": data, "synced_at": time.time()}})
        return True
    except Exception:
        return False
