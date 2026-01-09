🇺🇸 English | [🇪🇸 Español](README_ES.md)

# 🌱 Plant Disease Detector — AI & Full Stack Platform

### 📌 Overview
This project is a comprehensive web platform for the automatic detection of plant diseases using computer vision and artificial intelligence. It was designed and implemented as a complete engineering solution, from model training to deployment and user interface.

The system offers **two independent AI implementations** to solve the same problem, demonstrating adaptability and solid software architecture skills.

---

### 🎥 Demo in Action

[![Watch Plant Detector Demo](https://img.youtube.com/vi/C8H5XjXPsZc/0.jpg)](https://youtu.be/C8H5XjXPsZc)

*Click the image above to watch the full demonstration: Image upload, AI processing, and real-time diagnosis.*

---

### 📸 Screenshots

| Local Model Interface | Cloud AI (Gemini) Analysis |
| :---: | :---: |
| ![Local](./screenshots/local_ui.png) | ![Cloud](./screenshots/cloud_ui.png) |

---

### 🧠 Version 1 — Local Machine Learning Model
**Folder:** `/local-ml-version`

* **Tech Stack:** Python, TensorFlow / Keras, NumPy, PIL, Streamlit.
* **Features:**
  - Convolutional Neural Network (CNN) training for plant disease classification.
  - Image preprocessing and normalization.
  - Training epochs and performance evaluation.
  - Diagnostic visualization and confidence levels.

⚠️ **Model File:** The trained model file is not included in this repo due to GitHub size limits.
- **Download the model here:** [Google Drive Link](https://drive.google.com/drive/folders/1D8QPMVjWAiz_eDDrd5kVoVfdmNFQlbxw?usp=drive_link)
- **Placement:** After downloading, place it in: `local-ml-version/model_plantvillage.h5`.

---

### ☁️ Version 2 — Cloud AI with Gemini
**Folder:** `/gemini-ai-version`

* **Tech Stack:** Python, Streamlit, Google Gemini API, dotenv.
* **Features:**
  - Gemini 1.5 Flash integration for advanced image analysis.
  - Secure environment variable management for API credentials.
  - AI-generated diagnostic explanations.
  - Alternative inference architecture compared to the local model.

---

### 🧩 Demonstrated Skills
* Deep Learning & Computer Vision.
* Full Stack Development & AI API Integration.
* Software Architecture & Data Processing.
* Secure Application Design & AgriTech Solutions.

---

### 🚀 How to Run

1. **Clone repository:**
   ```bash
   git clone [https://github.com/smurhenao/plant-disease-detector.git](https://github.com/smurhenao/plant-disease-detector.git)
   cd plant-disease-detector
Run Local Version:

Bash

cd local-ml-version
pip install -r requirements.txt
streamlit run app.py
Run Gemini Version:

Bash

cd gemini-ai-version
pip install -r requirements.txt
# Create a .env file from .env.example and add your Gemini API Key
streamlit run app.py
🌍 Applications
Precision agriculture, crop disease diagnosis, academic research, and AgriTech solutions.

🧑‍💻 Author
Sebastian Murillo - Software Engineer | Full Stack Developer | AI & Data