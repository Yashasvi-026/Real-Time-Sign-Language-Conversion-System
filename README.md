# SignSpeak - Real-Time Sign Language to Speech Conversion

## Project Overview

SignSpeak is an AI-powered real-time sign language recognition and speech conversion system designed to help bridge the communication gap between sign language users and non-sign language users.

The system captures hand gestures using a webcam, detects hand landmarks using MediaPipe, and processes the sequence of landmarks using a deep learning model based on Conv1D and Bidirectional LSTM (BiLSTM).

The recognized sign words are collected and converted into natural English sentences using the Gemini API. The generated sentence is then converted into speech using an offline Text-to-Speech engine.

The system also allows users to add their own words and capture landmark samples directly through the webcam. These samples are stored in MongoDB and can be used for model training.

---

## Key Features

### Student / User

- Register and login securely
- OTP-based registration verification
- Forgot password and password reset
- Add custom sign-language words
- Capture landmark samples using webcam
- View added words and sample counts
- Perform real-time sign recognition
- Generate natural sentences from recognized words
- Convert generated sentences into speech

### Sign Recognition

- Real-time webcam-based hand detection
- Detection of up to two hands using MediaPipe
- Extraction of 21 landmarks per hand
- X, Y and Z coordinates for each landmark
- 126 landmark features per frame for two hands
- 30-frame gesture sequence
- Conv1D + BiLSTM based gesture classification
- Confidence-based prediction
- Prediction history for stable recognition

### Custom Dataset

- Users can add new words
- Landmark samples can be captured directly through the webcam
- Each sample contains a 30-frame landmark sequence
- Approximately 45 samples can be collected for a word
- Landmark samples are stored in MongoDB
- Training can be triggered after sufficient samples are collected

### AI Features

- Sign gesture recognition
- Word-level prediction
- Natural sentence formation using Gemini API
- Offline text-to-speech using pyttsx3

---

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Python
- Flask
- Flask REST API

### Computer Vision

- OpenCV
- MediaPipe

### Machine Learning / Deep Learning

- TensorFlow
- Keras
- Conv1D
- Bidirectional LSTM
- NumPy
- Scikit-learn
- Pickle

### NLP

- Gemini API
- Generative AI for sentence formation

### Speech

- pyttsx3

### Database

- MongoDB Atlas
- PyMongo
- BSON

### Authentication & Security

- bcrypt
- OTP-based email verification
- Environment variables

### Development Tools

- VS Code
- Git & GitHub
- Postman

---

## System Architecture

```text
                         WEBCAM
                            |
                            v
                       +---------+
                       | OpenCV  |
                       +----+----+
                            |
                            v
                    +---------------+
                    |   MediaPipe   |
                    |     Hands     |
                    +-------+-------+
                            |
                            v
                  Hand Landmark Detection
                            |
                            v
                 21 Landmarks per Hand
                            |
                            v
                  X, Y, Z Coordinates
                            |
                            v
                 126 Features per Frame
                            |
                            v
                  30 Frame Sequence
                            |
                            v
                       (30, 126)
                            |
                            v
                       +---------+
                       | Conv1D  |
                       +----+----+
                            |
                            v
                     MaxPooling1D
                            |
                            v
                       +---------+
                       | BiLSTM  |
                       +----+----+
                            |
                            v
                        Dropout
                            |
                            v
                       +---------+
                       | BiLSTM  |
                       +----+----+
                            |
                            v
                       Dense Layer
                            |
                            v
                         Softmax
                            |
                            v
                    Predicted Sign Word
                            |
                            v
                    Sentence Buffer
                            |
                            v
                    +---------------+
                    |   Gemini API  |
                    +-------+-------+
                            |
                            v
                     Natural Sentence
                            |
                            v
                        pyttsx3
                            |
                            v
                       Speech Output
