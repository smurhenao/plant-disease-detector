🇺🇸 English | [🇪🇸 Español](README_ES.md)

🌱 Plant Disease Detector — AI & Full Stack Platform

📌 Overview

This project is a complete web platform for automatic plant disease detection using computer vision and artificial intelligence.  
It was designed and implemented as a full engineering solution, from model training to deployment and user interface.

The system provides two independent AI implementations to solve the same problem:

Local machine learning model trained from scratch

Cloud-based AI diagnosis using the Google Gemini API

This approach demonstrates strong software architecture skills and adaptability to modern AI systems.

🧠 Version 1 — Local Machine Learning Model  
Technologies

Python  
TensorFlow / Keras  
NumPy  
PIL  
Streamlit  

Features

Trained a Convolutional Neural Network (CNN) for plant disease classification.  
Image preprocessing and normalization.  
Model training with epochs and performance evaluation.  
Interactive web interface built with Streamlit.  
Displays diagnosis and confidence level.  
Modular and scalable architecture.

📂 Folder:

/local-ml-version

☁️ Version 2 — Cloud AI with Gemini  
Technologies

Python  
Streamlit  
Google Gemini API  
dotenv  

Features

Integrated Gemini 2.0 Flash for advanced image analysis.  
Secure environment variable handling for API credentials.  
Clean and responsive user interface.  
AI-generated explanations of the diagnosis.  
Alternative inference architecture compared to local ML.

🗂️ Model File  

The trained model file is not included in this repository due to GitHub file size limits.

You can download the trained model here:  
https://drive.google.com/drive/folders/1D8QPMVjWAiz_eDDrd5kVoVfdmNFQlbxw?usp=drive_link

After downloading, place the file:

local-ml-version/model_plantvillage.h5


📂 Folder:

/gemini-ai-version

🧩 Skills Demonstrated

Deep Learning  
Computer Vision  
Full Stack Development  
AI API Integration  
Software Architecture  
Data Processing  
Secure Application Design  

🚀 How to Run

Clone repository  
git clone https://github.com/smurhenao/plant-disease-detector.git  
cd plant-disease-detector  

Run local ML version  
cd local-ml-version  
pip install -r requirements.txt  
streamlit run app.py  

Run Gemini version  
cd gemini-ai-version  
pip install -r requirements.txt  
streamlit run app.py  

Create a .env file based on .env.example and add your Gemini API key.

🌍 Applications

Precision agriculture  
Crop disease diagnosis  
Academic research  
AgriTech solutions  

🧑‍💻 Author

Sebastian Murillo  
Software Engineer | Full Stack Developer | AI & Data

