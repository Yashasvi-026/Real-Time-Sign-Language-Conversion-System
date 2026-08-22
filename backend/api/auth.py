from flask import Blueprint, request, jsonify
from database import users, words
from bson import ObjectId
from database import samples
from datetime import datetime
import bcrypt
import random
import time
from email_service import send_otp

auth = Blueprint("auth", __name__)
pending_register = {}

pending_reset = {}



@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    if users.find_one({"email": email}):

        return jsonify({
            "success": False,
            "message": "Email already exists"
        }), 409

    otp = str(random.randint(100000, 999999))

    pending_register[email] = {

        "name": name,

        "password": password,

        "otp": otp,

        "time": time.time()
    }

    if send_otp(email, otp):

        return jsonify({

            "success": True,

            "message": "OTP sent successfully"
        })

    else:

        return jsonify({

            "success": False,

            "message": "Unable to send OTP"

        }), 500
@auth.route("/verify-register-otp", methods=["POST"])
def verify_register_otp():

    data = request.get_json()

    email = data.get("email")

    otp = data.get("otp")

    if email not in pending_register:

        return jsonify({

            "success": False,

            "message": "OTP expired"

        }), 400

    user = pending_register[email]

    if time.time() - user["time"] > 300:

        del pending_register[email]

        return jsonify({

            "success": False,

            "message": "OTP expired"

        }), 400

    if otp != user["otp"]:

        return jsonify({

            "success": False,

            "message": "Invalid OTP"

        }), 400

    hashed_password = bcrypt.hashpw(

        user["password"].encode(),

        bcrypt.gensalt()

    ).decode()

    users.insert_one({

        "name": user["name"],

        "email": email,

        "password": hashed_password,
        "words": []

    })

    del pending_register[email]

    return jsonify({

        "success": True,

        "message": "Registration Successful"

    })


@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})

    if not user:

        return jsonify({
            "success": False,
            "message": "Email not found"
        }), 404

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):

        return jsonify({
            "success": False,
            "message": "Incorrect Password"
        }), 401

    return jsonify({

        "success": True,
        "message": "Login Successful",
        "name": user["name"],
        "userId": str(user["_id"])

    })

@auth.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()

    email = data.get("email")

    user = users.find_one({"email": email})

    if not user:

        return jsonify({
            "success": False,
            "message": "Email not found"
        }), 404

    otp = str(random.randint(100000, 999999))

    pending_reset[email] = {

        "otp": otp,

        "time": time.time()

    }

    if send_otp(email, otp):

        return jsonify({

            "success": True,

            "message": "OTP sent successfully"

        })

    return jsonify({

        "success": False,

        "message": "Unable to send OTP"

    }), 500
@auth.route("/verify-forgot-otp", methods=["POST"])
def verify_forgot_otp():

    data = request.get_json()

    email = data.get("email")
    otp = data.get("otp")

    if email not in pending_reset:

        return jsonify({
            "success": False,
            "message": "OTP Expired"
        }), 400

    if pending_reset[email]["otp"] != otp:

        return jsonify({
            "success": False,
            "message": "Invalid OTP"
        }), 400

    return jsonify({
        "success": True,
        "message": "OTP Verified"
    })
@auth.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    hashed_password = bcrypt.hashpw(

        password.encode("utf-8"),

        bcrypt.gensalt()

    ).decode("utf-8")

    result = users.update_one(

        {

            "email": email

        },

        {

            "$set": {

                "password": hashed_password

            }

        }

    )

    print("Matched:", result.matched_count)
    print("Modified:", result.modified_count)

    if email in pending_reset:

        del pending_reset[email]

    return jsonify({

        "success": True,

        "message": "Password Updated Successfully"

    })
@auth.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):

    try:

        user = users.find_one(
            {"_id": ObjectId(user_id)},
            {"password": 0}
        )

        if not user:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({

            "success": True,

            "name": user["name"],

            "email": user["email"]

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


@auth.route("/add-word", methods=["POST"])
def add_word():

    data = request.get_json()

    user_id = data.get("userId")
    word = data.get("word").strip().upper()

    if word == "":

        return jsonify({
            "success": False,
            "message": "Word cannot be empty"
        }), 400

    if words.find_one({

        "userId": ObjectId(user_id),

        "word": word

    }):

        return jsonify({

            "success": False,

            "message": "Word already exists"

        }), 409

    words.insert_one({

        "userId": ObjectId(user_id),

        "word": word

    })

    return jsonify({

        "success": True,

        "message": "Word Added Successfully"

    })
@auth.route("/get-words/<user_id>", methods=["GET"])
def get_words(user_id):

    data = []

    for word in words.find({"userId": ObjectId(user_id)}):

        data.append({

            "id": str(word["_id"]),

            "word": word["word"]

        })

    return jsonify({

        "success": True,

        "words": data

    })
@auth.route("/delete-word/<word_id>", methods=["DELETE"])
def delete_word(word_id):

    word = words.find_one({"_id": ObjectId(word_id)})

    if not word:

        return jsonify({

            "success": False,

            "message": "Word not found"

        }),404

    # Delete all samples of this word
    samples.delete_many({

        "userId": word["userId"],

        "word": word["word"]

    })

    # Delete the word
    words.delete_one({

        "_id": ObjectId(word_id)

    })

    return jsonify({

        "success": True,

        "message": "Word Deleted Successfully"

    })

@auth.route("/get-sample-count/<user_id>/<word>", methods=["GET"])
def get_sample_count(user_id, word):

    count = samples.count_documents({

        "userId": ObjectId(user_id),

        "word": word

    })

    return jsonify({

        "success": True,

        "count": count

    })
@auth.route("/delete-account/<user_id>", methods=["DELETE"])
def delete_account(user_id):

    user = users.find_one({

        "_id": ObjectId(user_id)

    })

    if user is None:

        return jsonify({

            "success": False,

            "message": "User Not Found"

        }),404

    users.delete_one({

        "_id": ObjectId(user_id)

    })

    words.delete_many({

        "userId": ObjectId(user_id)

    })

    samples.delete_many({

        "userId": ObjectId(user_id)

    })

    return jsonify({

        "success": True,

        "message": "Account Deleted"

    })
