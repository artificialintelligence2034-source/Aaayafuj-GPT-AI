# 🧠 Install Aaayafuj-GPT-AI (Windows)
<img width="1427" height="928" alt="Screenshot 2026-01-07 154228" src="https://github.com/user-attachments/assets/09021ee9-ad2d-4933-8196-ba86e64c91c1" />

Repo:
👉 https://github.com/artificialintelligence2034-source/Aaayafuj-GPT-AI.git

✅ REQUIREMENTS (Install FIRST)
1️⃣ Install Git (IMPORTANT)

# Download & install Git for Windows:
👉 https://git-scm.com/download/win

After install, restart your PC (recommended).

# Verify:
    git --version

* 2️⃣ Install Python 3.10+
  * 👉 https://www.python.org/downloads/
* ✔ During install:

# ✅ Check Add Python to PATH
    python --version

3️⃣ Install PyCharm (Free)

👉 https://www.jetbrains.com/pycharm/download/

Choose Community Edition.

📥 CLONE THE PROJECT
Option A (Recommended – via PyCharm)

Open PyCharm

Click Get from VCS

Paste this URL:

https://github.com/artificialintelligence2034-source/Aaayafuj-GPT-AI.git


Click Clone

* ✅ Project will open automatically.
* Option B (Terminal Method)
# Open Command Prompt or PowerShell:
    git clone https://github.com/artificialintelligence2034-source/Aaayafuj-GPT-AI.git
    cd Aaayafuj-GPT-AI

# 📦 INSTALL DEPENDENCIES
     pip install -r requirements.txt
* In PyCharm Terminal (inside project folder):

# ⚠️ If this fails, run:
    pip install --upgrade pip
    pip install -r requirements.txt

# 🧠 DOWNLOAD LOCAL MODEL (CRITICAL)
   * This project is offline AI, so you must add a model.
   * Recommended model (fast & stable):
* 👉 https://huggingface.co/TheBloke/Mistral-7B-Instruct-GGUF

# Download:
* mistral-7b-instruct.Q4_K_M.gguf

* Create folder:
* models/

** Put file here:
* Aaayafuj-GPT-AI/models/mistral.gguf


*** (If config uses a different name, rename accordingly.)
** ▶️ RUN THE AI
# Look for main file (usually one of these):
`main.py`
`app.py`
`run.py`

# Then run:
    python main.py

* OR in PyCharm:
  * Right-click → Run

* ✅ IF YOU GET ERRORS (COMMON FIXES)
* ❌ llama-cpp-python error

# Run:
    pip install llama-cpp-python --upgrade --force-reinstall

# If CPU only:
    pip install llama-cpp-python --no-cache-dir

# ❌ Torch / SentenceTransformer error
    pip install torch sentence-transformers

# 🧠 HOW TO “TRAIN” IT (IMPORTANT)
 * This AI learns from files, not APIs.
 * Put your files here (example):

* data/
 * ├── `knowledge`.pdf
 * ├── `notes`.txt
 * ├── `info`.json


* Restart the AI → it learns again.

# 🏆 WHAT YOU NOW HAVE
* ✅ Offline GPT
* ✅ Learns from your files
* ✅ Private (no internet)
* ✅ Expandable intelligence
* ✅ Your own Aaayafuj GPT
