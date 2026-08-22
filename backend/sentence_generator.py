from google import genai
from config import GEMINI_API_KEY, MODEL_NAME

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_sentence(words):

    """
    words -> list of predicted words

    Example:
    ["I", "WANT", "WATER"]

    Returns:
    "I want water."
    """

    if len(words) == 0:
        return ""

    text = " ".join(words)

    prompt = f"""
You are an AI assistant for Sign Language Translation.

The following words were predicted from sign language gestures.

Your task is to convert them into ONE natural, grammatically correct English sentence.

Rules:
- Preserve the meaning.
- Reorder words if necessary.
- Add articles (a, an, the) only when required.
- Add helping verbs if needed.
- Return ONLY the final sentence.
- Do not explain anything.

Predicted Words:
{text}
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text.strip()

    except Exception as e:

        print("Gemini Error:", e)

        return text