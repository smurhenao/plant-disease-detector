import streamlit as st
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import os

# ================================
# CONFIGURACIÓN INICIAL
# ================================
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

st.set_page_config(
    page_title="IA Plant Detector",
    page_icon="🌱",
    layout="wide", # Usamos "wide" para aprovechar todo el ancho de la pantalla
)

# ================================
# UI & DISEÑO
# ================================
st.markdown('<h1 style="text-align: center;">🍃 Análisis de Plantas con IA </h1>', unsafe_allow_html=True)

uploaded = st.file_uploader("📸 Sube la foto de la planta", type=["jpg", "jpeg", "png"])

if uploaded:
    img = Image.open(uploaded)
    
    # Creamos dos columnas: la 1ra para la imagen y la 2da para el resultado
    col1, col2 = st.columns([1, 1.2], gap="medium") 

    with col1:
        st.image(img, caption="Imagen cargada", use_container_width=True)
        btn_analizar = st.button("🚀 Iniciar Análisis", use_container_width=True)

    with col2:
        if btn_analizar:
            with st.spinner("IA analizando..."):
                try:
                    # Prompt ajustado para ser breve y directo
                    response = model.generate_content([
                        "Actúa como un experto agrónomo. Analiza la imagen y responde de forma breve y estructurada: "
                        "1. Qué es. 2. Estado (Sana/Enferma). 3. Diagnóstico breve. 4. Recomendación rápida.",
                        img
                    ])
                    
                    st.markdown("### 🧠 Resultado del Análisis")
                    st.info(response.text) # El cuadro azul ayuda a que resalte y se vea ordenado
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.write("### ⬅️ Haz clic en el botón para ver el diagnóstico")