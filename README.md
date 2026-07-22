# VisionIQ 👁️✨

**VisionIQ** is a state-of-the-art AI-powered Visual Intelligence Platform that analyzes, understands, and extracts knowledge from physical objects and images. 

Built with a robust microservice-oriented architecture and a sleek, dynamic user interface, VisionIQ enables seamless visual data processing using advanced Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG).

![VisionIQ Banner](docs/assets/visioniq_banner.png)

---

## 🚀 Key Features

### 🧠 Intelligent Vision Processing
- **Image Scanning & Analysis**: Upload physical objects, documents, or scenery for instant AI breakdown.
- **RAG-Powered AI Chat**: Have contextual conversations with the AI about your uploaded images. The AI retrieves specific details from your past scans to provide highly accurate, memory-aware responses.

### 🔐 Secure & Scalable Architecture
- **JWT Authentication Flow**: Fully secure registration, login, and robust session management with token rotation.
- **Enterprise-Grade Backend**: Built with **FastAPI** following Clean Architecture principles. Includes centralized error handling, structured logging, and dependency injection.
- **Vector Search Engine**: Employs PostgreSQL with `pgvector` for lightning-fast semantic search across your visual knowledge base.

### 🎨 Premium User Experience
- **Modern Next.js Frontend**: Highly responsive interface built on the Next.js 14 App Router and React Query.
- **Dynamic Theming**: Seamlessly switch between light, dark, and system themes with persistent user preferences.
- **Glassmorphism & Micro-animations**: A fluid, premium aesthetic featuring tailored HSL color palettes and smooth Framer Motion transitions.

---

## 🏗️ Tech Stack

**Frontend:** Next.js 14, React, Tailwind CSS, Radix UI, React Query, Framer Motion, Next-Themes  
**Backend:** Python, FastAPI, SQLAlchemy (PostgreSQL + pgvector), Alembic, Pydantic, Tenacity  
**AI & Search:** Google Gemini (Multimodal Vision), Groq (Blazing fast LLM Chat), LangChain, HuggingFace Embeddings  
**Infrastructure:** Docker, Docker Compose, Redis

---



## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
