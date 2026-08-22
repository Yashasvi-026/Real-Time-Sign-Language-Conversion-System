from flask import Flask
from flask_cors import CORS
from api.auth import auth
from api.sentence_api import generate
import sys
import os
from tts import speak
from flask import request, jsonify
from api.predict_api import predict, clear_sentence
from api.sample_api import save_sample
from api.train_api import training_status


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth)


@app.route("/")
def home():

    return {

        "message":"SignSpeak Backend Running"

    }


@app.route("/predict", methods=["POST"])
def predict_word():

    data = request.get_json()
    print(data.keys())
    user_id = data.get("userId")
    sequence = data.get("sequence")
    print("Sequence Length:", len(sequence))
    if not user_id or not sequence:

        return jsonify({

            "success":False,

            "message":"Missing Data"

        }),400

    return jsonify(

        predict(user_id,sequence)

    )
@app.route("/clear-sentence", methods=["POST"])
def clear():

    data=request.get_json()

    user_id=data.get("userId")

    clear_sentence(user_id)

    return jsonify({

        "success":True,

        "message":"Sentence Cleared"

    })

@app.route("/save-sample", methods=["POST"])
def save_sample_api():

    data = request.get_json()

    user_id = data.get("userId")

    word = data.get("word")

    landmarks = data.get("landmarks")

    return jsonify(

        save_sample(

            user_id,

            word,

            landmarks

        )

    )

@app.route("/generate-sentence", methods=["POST"])
def generate_api():

    data = request.get_json()

    words = data.get("words")

    return jsonify(

        generate(words)

    )

@app.route("/speak", methods=["POST"])
def speak_api():

    data = request.get_json()

    sentence = data.get("sentence", "")

    if sentence.strip() == "":

        return jsonify({

            "success": False,

            "message": "Empty Sentence"

        })

    speak(sentence)

    return jsonify({

        "success": True

    })
@app.route("/training-status")
def get_training_status():

    return jsonify(training_status)

if __name__ == "__main__":

    app.run(debug=True)
