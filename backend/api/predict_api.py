import numpy as np
import pickle

from tensorflow.keras.models import load_model
from collections import Counter


model = load_model("sign_model_bilstm.keras")

with open("label_encoder_bilstm.pkl", "rb") as f:
    encoder = pickle.load(f)


def reload_model():

    global model
    global encoder

    model = load_model(

        "sign_model_bilstm.keras"

    )

    with open(

        "label_encoder_bilstm.pkl",

        "rb"

    ) as f:

        encoder = pickle.load(f)

    print("Model Reloaded")


prediction_history = {}

sentence_buffer = {}


def predict(user_id, sequence):

    print("-------")
    print("User:", user_id)
    print("Frames:", len(sequence))
    print("Shape:", np.array(sequence).shape)

    if user_id not in prediction_history:

        prediction_history[user_id] = []

        sentence_buffer[user_id] = []

    prediction = "Waiting..."

    confidence = 0

    input_data = np.expand_dims(

        np.array(sequence),

        axis=0

    )
    print(input_data.shape)
    result = model.predict(

        input_data,

        verbose=0

    )

    confidence = float(np.max(result))

    pred_class = np.argmax(result)

    if confidence >= 0.99:

        prediction = encoder.inverse_transform(

            [pred_class]

        )[0]

        prediction_history[user_id].append(prediction)

        if len(prediction_history[user_id]) > 20:

            prediction_history[user_id].pop(0)

        counts = Counter(prediction_history[user_id])

        word, freq = counts.most_common(1)[0]

        if freq >= 19:

            prediction = word

            if (

                len(sentence_buffer[user_id]) == 0

                or

                sentence_buffer[user_id][-1] != word

            ):

                sentence_buffer[user_id].append(word)

        else:

            prediction = "Waiting..."

    return {

        "success": True,

        "word": prediction,

        "confidence": round(confidence * 100, 2),

    }


def clear_sentence(user_id):

    if user_id in prediction_history:

        prediction_history[user_id].clear()

    if user_id in sentence_buffer:

        sentence_buffer[user_id].clear()
