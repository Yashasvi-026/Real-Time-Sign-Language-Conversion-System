import numpy as np
import pickle
from api.predict_api import reload_model

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Input,
    Conv1D,
    MaxPooling1D,
    Bidirectional,
    LSTM,
    Dense,
    Dropout
)
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import to_categorical

from database import samples, words

training_status = {

    "training": False,

    "completed": False

}

def train_model():

    import traceback

    print("\n  TRAIN_MODEL CALLED ")

    training_status["training"] = True
    training_status["completed"] = False

    try:

        print("1. Loading samples from database ")

        all_samples = list(samples.find({}))

        print("2. Total Samples:", len(all_samples))

        if len(all_samples) == 0:

            print("No Samples Found")

            return

        X = []
        y = []

        print("3. Preparing dataset ")

        for sample in all_samples:

            X.append(sample["landmarks"])

            if "word" in sample:

                y.append(sample["word"])

            elif "word_id" in sample:

                word_doc = words.find_one({
                "_id": sample["word_id"]
            })

                if word_doc is None:
                    continue

                y.append(word_doc["word"])

            else:

                print("Skipping invalid sample:", sample)
                continue

        print("4. Converting to numpy ")

        X = np.array(X, dtype=np.float32)
        y = np.array(y)

        print("X Shape:", X.shape)
        print("Y Shape:", y.shape)

        print("5. Encoding labels ")

        encoder = LabelEncoder()

        y_encoded = encoder.fit_transform(y)

        print("Classes:", encoder.classes_)
        print("Number of Classes:", len(encoder.classes_))

        y = to_categorical(y_encoded)

        print("Encoded Y Shape:", y.shape)

        print("6. Splitting dataset ")

        X_train, X_test, y_train, y_test = train_test_split(

            X,
            y,

            test_size=0.2,

            random_state=42,

            stratify=y_encoded

        )

        print("Train Shape:", X_train.shape)
        print("Test Shape :", X_test.shape)

        print("7. Building CNN-BiLSTM Model ")

        model = Sequential([

            Input(shape=(30,126)),

            Conv1D(
                filters=64,
                kernel_size=3,
                activation="relu"
            ),

            MaxPooling1D(pool_size=2),

            Bidirectional(

                LSTM(
                    64,
                    return_sequences=True
                )

            ),

            Dropout(0.3),

            Bidirectional(

                LSTM(32)

            ),

            Dense(

                64,

                activation="relu"

            ),

            Dropout(0.3),

            Dense(

                y_train.shape[1],

                activation="softmax"

            )

        ])

        print("8. Compiling model ")

        model.compile(

            optimizer="adam",

            loss="categorical_crossentropy",

            metrics=["accuracy"]

        )

        early_stop = EarlyStopping(

            monitor="val_loss",

            patience=10,

            restore_best_weights=True

        )

        print("\n TRAINING STARTED \n")

        history = model.fit(

            X_train,

            y_train,

            validation_data=(X_test, y_test),

            epochs=100,

            batch_size=8,

            callbacks=[early_stop],

            verbose=1

        )

        print("\n TRAINING FINISHED \n")

        loss, acc = model.evaluate(

            X_test,

            y_test,

            verbose=1

        )

        print("Training Accuracy:", acc)

        print("9. Saving model")

        model.save(

            "sign_model_bilstm.keras"

        )

        print("10. Saving label encoder")

        with open(

            "label_encoder_bilstm.pkl",

            "wb"

        ) as f:

            pickle.dump(

                encoder,

                f

            )

        print("11. Reloading prediction model")

        reload_model()

        print("TRAINING COMPLETED SUCCESSFULLY ")

    except Exception:

        print("\n TRAINING FAILED \n")

        traceback.print_exc()

    finally:

        training_status["training"] = False

        training_status["completed"] = True

    return {

        "success": True,

        "message": "Training Completed"

    }
