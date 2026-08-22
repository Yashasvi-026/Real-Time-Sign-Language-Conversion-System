from sentence_generator import generate_sentence

def generate(words):
    print("WORDS:", words)
    print("TYPE:", type(words))
    sentence = generate_sentence(words)

    return {

        "success": True,

        "sentence": sentence

    }
