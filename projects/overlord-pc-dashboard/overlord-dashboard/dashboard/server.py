import os
from functools import wraps
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from jsonschema import validate, ValidationError
from markupsafe import escape

# --- INITIALIZATION ---

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- FIREBASE INITIALIZATION ---
# The GOOGLE_APPLICATION_CREDENTIALS env var (set in .env) points to the key file.
# The SDK automatically finds and uses it.
try:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(
        cred,
        {
            "projectId": os.getenv("FIREBASE_PROJECT_ID", "studio-6082148059-d1fec"),
        },
    )
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"CRITICAL: Firebase initialization failed: {e}")
    db = None

# --- SECURITY CONFIGURATION ---

# 1. API Key
API_KEY = os.getenv("OVERLORD_API_KEY")
if not API_KEY:
    print("CRITICAL: OVERLORD_API_KEY is not set. Please create a .env file.")

# 2. Rate Limiting (using Flask-Limiter)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# 3. Security Headers (using Flask-Talisman)
csp = {
    "default-src": ["""self"""],
    "script-src": ["""self"""],
    "style-src": ["""self"""],
    "img-src": ["""self""", "data:"],
}
talisman = Talisman(app, content_security_policy=csp)

# 4. Cross-Origin Resource Sharing (CORS)
CORS(
    app,
    resources={
        r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}
    },
)


# --- API KEY DECORATOR ---


def api_key_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if (
            request.headers.get("X-API-KEY")
            and request.headers.get("X-API-KEY") == API_KEY
        ):
            return f(*args, **kwargs)
        else:
            return (
                jsonify(
                    {
                        "message": escape(
                            "ERROR: Unauthorized. API key is missing or invalid."
                        )
                    }
                ),
                401,
            )

    return decorated_function


# --- ROUTES ---


@app.route("/")
def home():
    return jsonify({"status": escape("Overlord Dashboard API is online")})


@app.route("/health")
@limiter.exempt
def health_check():
    return jsonify({"status": escape("ok")})


@app.route("/api/rd/configure", methods=["POST"])
@api_key_required
@limiter.limit("10 per minute")
def configure_rd():
    data = request.get_json()

    rd_configure_schema = {
        "type": "object",
        "properties": {"rd_api_key": {"type": "string", "minLength": 32}},
        "required": ["rd_api_key"],
    }

    try:
        validate(instance=data, schema=rd_configure_schema)
    except (ValidationError, TypeError) as e:
        return (
            jsonify({"message": escape(f"ERROR: Invalid request body. {str(e)}")}),
            400,
        )

    rd_key = data.get("rd_api_key")

    # Example of writing to Firestore
    if db:
        try:
            doc_ref = db.collection("configurations").document("real_debrid")
            doc_ref.set(
                {
                    "api_key_set_time": firestore.SERVER_TIMESTAMP,
                    "api_key_truncated": f"{rd_key[:4]}...{rd_key[-4:]}",
                }
            )
            print("Real-Debrid key info stored in Firestore.")
        except Exception as e:
            print(f"Error writing to Firestore: {e}")
            return (
                jsonify(
                    {
                        "message": escape(
                            "Configuration received, but failed to store in database."
                        )
                    }
                ),
                500,
            )

    print("Received a valid request to configure Real-Debrid.")
    return jsonify({"message": escape("Real-Debrid configured successfully.")})


# --- SERVER STARTUP ---

if __name__ == "__main__":
    print("Starting Overlord Dashboard Server...")
    print(
        "IMPORTANT: This is a development server. Do not use in a production environment."
    )
    app.run(host="0.0.0.0", port=5001, debug=False)
