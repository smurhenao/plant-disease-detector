import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image
import json

st.set_page_config(page_title="Clasificador de Enfermedades en Hojas 🌿", layout="centered")

st.title("🌿 Clasificador de Enfermedades en Hojas con IA 🤖")
st.write("Sube una imagen de una hoja y el modelo detectará la enfermedad.")

# Cargar el modelo
model = tf.keras.models.load_model("model_plantvillage.h5")

# Cargar mapa de clases (llaves son nombres)
with open("class_map.json", "r") as f:
    class_map_raw = json.load(f)

# Invertir mapa: de {nombre: número} a {número: nombre}
class_map = {v: k for k, v in class_map_raw.items()}

IMG_SIZE = (224, 224)

def predict(img):
    img = img.resize(IMG_SIZE)
    img = np.array(img) / 255.0
    img = np.expand_dims(img, 0)
    preds = model.predict(img)
    class_index = np.argmax(preds[0])
    return class_map[class_index], float(preds[0][class_index])

uploaded = st.file_uploader("Sube tu imagen aquí:", type=["jpg", "jpeg", "png"])

if uploaded:
    img = Image.open(uploaded)
    st.image(img, caption="Imagen subida", use_container_width=True)

    if st.button("Clasificar"):
        label, confidence = predict(img)
        st.success(f"🌱 Resultado: **{label}**")
        st.info(f"Confianza: **{confidence * 100:.2f}%**")
