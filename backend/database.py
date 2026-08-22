from pymongo import MongoClient
MONGO_URI = "mongodb+srv://yashasvichauhan26jul_db_user:yrZ6NQWzpnmkTYQH@cluster0.dq2ruzy.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGO_URI)

db = client["signspeak"]

users = db["users"]
words = db["words"]
samples = db["samples"]
