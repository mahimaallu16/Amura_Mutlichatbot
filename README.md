# 🚀AMURA- MultiChat AI Intelligent Multi-Agent Assistant

![MultiChat UI](https://drive.google.com/uc?id=1zGsxVWIBMiq4_AF4iDO0DV-aQWXg8TtF)

**MultiChat AI** is a cutting-edge, multi-agent assistant system built to process and respond to a variety of user inputs such as PDFs, Excel files, textual queries, and notebook-style notes. Designed for real-world productivity and seamless interaction, it uses specialized agents to deliver accurate, context-aware, and dynamic answers—backed by the power of **Gemini Pro**, **LangChain**, and **Python**.

---

## 🌟 Key Features

- 🔍 **PDF Agent** – Reads, understands, and answers queries from uploaded PDF documents.
- 📊 **Excel Agent** – Processes spreadsheets using intelligent table understanding.
- 📓 **Notebook Agent** – Parses notes or text files to deliver answers or summaries.
- 💬 **Chat Agent** – Handles general Q&A with deep LLM capabilities.
- 🧠 **Contextual Intelligence** – Real-time multi-agent routing & context handling.
- 🌐 **Modern UI** – Responsive and professional web interface for users.
- 📁 **Drag & Drop Upload** – Instantly process files from your local system.
- 🛠️ **Fully Modular Backend** – Built on FastAPI with clear API documentation.


## ⚙️ System Architecture
![MultiChat UI](https://drive.google.com/uc?id=1zGsxVWIBMiq4_AF4iDO0DV-aQWXg8TtF)
![Architecture](https://drive.google.com/file/d/10syv-T4GTTYEqEqrbIwWhksA6N48tIsq)


> All user inputs are routed through the intelligent backend. The right agent is automatically selected, and responses are returned in real time.

---

## 🧱 Tech Stack

| Layer          | Technology |
|----------------|------------|
| 💻 Frontend     | React.js, Tailwind CSS |
| 🧠 Backend      | FastAPI (Python) |
| 🤖 AI Models    | Gemini Pro API, OpenAI GPT-4 (optional fallback) |
| 📚 Memory/Tools | LangChain Agents, ChromaDB, Pandas |
| 🧪 Parsing      | PyMuPDF, PDFPlumber, openpyxl |
| ☁️ Deployment   | Docker, AWS S3, Railway/Render/Heroku |

---

🚀 Getting Started
1. Clone the Repository
  https://github.com/mahimaallu16/Amura_Mutlichatbot\
  cd multichat-ai
2. Set Up a Virtual Environment

  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
3. Install Dependencies

  pip install -r requirements.txt
4. Create a .env File
  env
  GEMINI_API_KEY=your_gemini_api_key
  OPENAI_API_KEY=your_optional_openai_key
  VECTOR_DB=./db
5. Start the Backend Server
  uvicorn app.main:app --reload
  Visit http://localhost:8000/docs to access the interactive Swagger API.

✅ Future Enhancements
🎥 Add Text-to-Video Agent using Gemini Pro Vision or external APIs

🧑‍💼 User login & role-based agent access

📊 Dashboard analytics and usage heatmaps

💾 Persistent vector storage (PostgreSQL, Pinecone)

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss the roadmap or changes you’d like to make.

