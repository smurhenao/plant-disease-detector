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
model = genai.GenerativeModel("models/gemini-2.0-flash")


st.set_page_config(
    page_title="Clasificador con Gemini",
    page_icon="🤖",
    layout="centered",
)

# ================================
# ESTILOS
# ================================

st.markdown("""
<style>
    .title {
        font-size: 40px;
        font-weight: 700;
        text-align: center;
        color: #ffffff;
        margin-bottom: 20px;
    }
    .sub {
        font-size: 18px;
        text-align: center;
        color: #cfcfcf;
        margin-bottom: 40px;
    }
    .result-card {
        background: #1e1e1e;
        padding: 25px;
        border-radius: 15px;
        border: 1px solid #3a3a3a;
        color: #e6e6e6;
        box-shadow: 0px 0px 10px #00000055;
    }
</style>
""", unsafe_allow_html=True)

# ================================
# UI
# ================================

st.markdown('<div class="title">🔍 Clasificador De hojas y plantas con Gemini 🍃🤖 </div>', unsafe_allow_html=True)
st.markdown('<div class="sub">Sube una imagen y deja que la IA la analice</div>', unsafe_allow_html=True)

uploaded = st.file_uploader("📸 Sube una imagen", type=["jpg", "jpeg", "png"])

if uploaded:
    img = Image.open(uploaded)
    st.image(img, caption="Imagen cargada", use_container_width=True)

    with st.spinner("Analizando con Gemini... ⏳"):
        response = model.generate_content([
            "Analiza esta imagen y describe qué es, qué contiene,cualquier detalle relevante,si es una planta sana o enferma,que tiene y recomendaciones si esta enferma.",
            img
        ])

    st.markdown("<br>", unsafe_allow_html=True)

    st.markdown('<div class="result-card">', unsafe_allow_html=True)
    st.markdown("### 🧠 Resultado del análisis")
    st.write(response.text)
    st.markdown('</div>', unsafe_allow_html=True)
