from database import samples, words
from api.train_api import train_model
import threading
from bson import ObjectId


def save_sample(user_id, word, landmarks):

    word_data = words.find_one({

        "userId": ObjectId(user_id),

        "word": word
    })

    if word_data is None:

        return {

            "success": False,

            "message": "Word not found"
        }

    samples.insert_one({

        "userId": ObjectId(user_id),

        "word": word,

        "landmarks": landmarks
    })


    words.update_one(
        {
            "userId": ObjectId(user_id),

            "word": word
        },

        {
            "$inc": {
                "sampleCount": 1
            }
        }
    )

    total_samples = samples.count_documents({

        "userId": ObjectId(user_id),

        "word": word

    })

    if total_samples == 45:

        threading.Thread(

    target=train_model,

    daemon=True

).start()

        return {

        "success": True,

        "training": True,

        "sampleCount": total_samples,

        "requiredSamples": 45,

        "message": "Training Started"
    }

    return {

        "success": True,

        "training": False,

        "sampleCount": total_samples,

        "requiredSamples": 45,

        "message": "Sample Saved"

    }
