🇪🇸 Español | [🇺🇸 English](README.md)
# 🌱 Detector de Enfermedades en Plantas — Plataforma de IA y Full Stack

### 📌 Descripción General
Este proyecto es una plataforma web completa para la detección automática de enfermedades en plantas usando visión por computador e inteligencia artificial. Fue diseñado e implementado como una solución de ingeniería completa, desde el entrenamiento del modelo hasta el despliegue y la interfaz de usuario.

El sistema ofrece **dos implementaciones independientes** de IA para resolver el mismo problema, demostrando adaptabilidad y sólidas habilidades en arquitectura de software.

---

### 🎥 Demo en Acción

[![Mira la demo del Detector de Plantas](https://img.youtube.com/vi/C8H5XjXPsZc/0.jpg)](https://youtu.be/C8H5XjXPsZc)

*Haz clic en la imagen de arriba para ver la demostración completa: Carga de imágenes, procesamiento de IA y diagnóstico en tiempo real.*

---

### 📸 Screenshots (Capturas de Pantalla)

| Interfaz del Sistema (Local) | Análisis con IA (Gemini) |
| :---: | :---: |
| ![Local](./screenshots/local_ui.png) | ![Cloud](./screenshots/cloud_ui.png) |

---

### 🧠 Versión 1 — Modelo de Aprendizaje Automático Local
**Carpeta:** `/local-ml-version`

* **Tecnologías:** Python, TensorFlow / Keras, NumPy, PIL, Streamlit.
* **Características:**
  - Entrenamiento de una Red Neuronal Convolucional (CNN) para clasificación.
  - Preprocesamiento y normalización de imágenes.
  - Entrenamiento por épocas y evaluación de rendimiento.
  - Visualización del diagnóstico y nivel de confianza.

⚠️ **Archivo del Modelo:** El archivo entrenado no se incluye en este repositorio por límites de tamaño de GitHub.
- **Descarga el modelo aquí:** [Enlace a Google Drive](https://drive.google.com/drive/folders/1D8QPMVjWAiz_eDDrd5kVoVfdmNFQlbxw?usp=drive_link)
- **Ubicación:** Después de descargarlo, ubícalo en: `local-ml-version/model_plantvillage.h5`.

---

### ☁️ Versión 2 — IA en la Nube con Gemini
**Carpeta:** `/gemini-ai-version`

* **Tecnologías:** Python, Streamlit, API de Google Gemini (1.5 Flash), dotenv.
* **Características:**
  - Integración de **Gemini 2.5 Flash** para análisis avanzado de imágenes.
  - Manejo seguro de variables de entorno para credenciales de API.
  - Explicaciones del diagnóstico detalladas generadas por IA.
  - Arquitectura de inferencia alternativa frente al modelo local.

---

### 🧩 Habilidades Demostradas
* Deep Learning y Visión por Computador.
* Desarrollo Full Stack e Integración de APIs de IA.
* Arquitectura de Software y Procesamiento de Datos.
* Diseño de Aplicaciones Seguras y Soluciones AgriTech.

---

### 🚀 Cómo Ejecutar

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/smurhenao/plant-disease-detector.git](https://github.com/smurhenao/plant-disease-detector.git)
   cd plant-disease-detector
Ejecutar Versión Local:

Bash

cd local-ml-version
pip install -r requirements.txt
streamlit run app.py
Ejecutar Versión Gemini:

Bash

cd gemini-ai-version
pip install -r requirements.txt
# Crea un archivo .env a partir de .env.example y agrega tu clave de API de Gemini.
streamlit run app.py
🌍 Aplicaciones
Agricultura de precisión, diagnóstico de enfermedades en cultivos, investigación académica y soluciones AgriTech.

🧑‍💻 Autor
Sebastian Murillo - Ingeniero de Software | Desarrollador Full Stack | IA & Datos