🇺🇸 English | [🇪🇸 Español](README_ES.md)

🌱 Detector de Enfermedades en Plantas — Plataforma de IA y Full Stack

📌 Descripción General

Este proyecto es una plataforma web completa para la detección automática de enfermedades en plantas usando visión por computador e inteligencia artificial.  
Fue diseñado e implementado como una solución de ingeniería completa, desde el entrenamiento del modelo hasta el despliegue y la interfaz de usuario.

El sistema ofrece dos implementaciones independientes de IA para resolver el mismo problema:

Modelo de aprendizaje automático entrenado localmente desde cero

Diagnóstico con IA en la nube usando la API de Google Gemini

Este enfoque demuestra sólidas habilidades en arquitectura de software y adaptabilidad a sistemas modernos de inteligencia artificial.

🧠 Versión 1 — Modelo de Aprendizaje Automático Local  
Tecnologías

Python  
TensorFlow / Keras  
NumPy  
PIL  
Streamlit  

Características

Entrenamiento de una Red Neuronal Convolucional (CNN) para la clasificación de enfermedades en plantas.  
Preprocesamiento y normalización de imágenes.  
Entrenamiento del modelo por épocas y evaluación de rendimiento.  
Interfaz web interactiva desarrollada con Streamlit.  
Visualización del diagnóstico y nivel de confianza.  
Arquitectura modular y escalable.

📂 Carpeta:

/local-ml-version

☁️ Versión 2 — IA en la Nube con Gemini  
Tecnologías

Python  
Streamlit  
API de Google Gemini  
dotenv  

Características

Integración de Gemini 2.0 Flash para análisis avanzado de imágenes.  
Manejo seguro de variables de entorno para credenciales de API.  
Interfaz de usuario limpia y responsiva.  
Explicaciones del diagnóstico generadas por IA.  
Arquitectura de inferencia alternativa frente al modelo local.

📂 Carpeta:

/gemini-ai-version

🧩 Habilidades Demostradas

Deep Learning  
Visión por Computador  
Desarrollo Full Stack  
Integración de APIs de Inteligencia Artificial  
Arquitectura de Software  
Procesamiento de Datos  
Diseño de Aplicaciones Seguras  

🚀 Cómo Ejecutar

Clonar repositorio  
git clone https://github.com/smurhenao/plant-disease-detector.git  
cd plant-disease-detector  

Ejecutar versión local  
cd local-ml-version  
pip install -r requirements.txt  
streamlit run app.py  

Ejecutar versión Gemini  
cd gemini-ai-version  
pip install -r requirements.txt  
streamlit run app.py  

Crea un archivo .env a partir de .env.example y agrega tu clave de API de Gemini.

🌍 Aplicaciones

Agricultura de precisión  
Diagnóstico de enfermedades en cultivos  
Investigación académica  
Soluciones AgriTech  

🧑‍💻 Autor

Sebastian Murillo  
Ingeniero de Software | Desarrollador Full Stack | IA & Datos
