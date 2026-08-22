import pyttsx3

engine = pyttsx3.init()

engine.setProperty("rate", 160)
engine.setProperty("volume", 1.0)


def speak(text):

    if text.strip() == "":
        return

    engine.say(text)
    engine.runAndWait()