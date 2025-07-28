# 🚀AMURA- MultiChat AI Intelligent Multi-Agent Assistant

![MultiChat UI](https://drive.google.com/file/d/1zGsxVWIBMiq4_AF4iDO0DV-aQWXg8TtF/view?usp=sharing))

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

---

## 🖼️ Screenshots

| Home Dashboard | PDF Chat Interface | Excel Query |
|----------------|--------------------|-------------|
| ![Home](https://your-image-host.com/multichat-home.png) | ![PDF](https://your-image-host.com/multichat-pdf.png) | ![Excel](https://your-image-host.com/multichat-excel.png) |

---

## ⚙️ System Architecture

![Architecture](https://your-image-host.com/multichat-architecture.png)

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

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/multichat-ai.git
cd multichat-ai
