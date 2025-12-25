# 📝 Devpost Submission Text

**Copy and paste these sections into your Devpost submission form**

---

## Project Title

**Nhaka 2.0 - Archive Resurrection**

---

## Tagline (Short Description)

AI-powered historical document restoration using a multi-agent swarm architecture with PaddleOCR-VL and ERNIE via Novita AI.

---

## About the Project

### Inspiration

Two billion people risk losing their family histories as historical documents fade into illegibility. In Zimbabwe, colonial-era archives from 1888-1923 containing treaties, land grants, and personal letters written in pre-1955 Doke Shona orthography are deteriorating daily. Traditional OCR fails on iron-gall ink degradation, handwritten colonial scripts, and specialized characters like ɓ, ɗ, ȿ, and ɀ.

We built Nhaka 2.0 ("Heritage" in Shona) to bring these faded documents back to life using the power of ERNIE and PaddleOCR-VL.

### What it does

Nhaka 2.0 uses a **multi-agent swarm architecture** where 5 specialized AI agents collaborate in real-time:

1. **🔬 Scanner Agent** - Uses PaddleOCR-VL via Novita AI for multimodal document analysis, detecting ink degradation and extracting text from damaged documents

2. **📚 Linguist Agent** - Transliterates pre-1955 Doke Shona orthography (ɓ, ɗ, ȿ, ɀ, ŋ, ʃ, ʒ) to modern Shona script using ERNIE LLM

3. **📜 Historian Agent** - Verifies historical accuracy by cross-referencing names, dates, and events against our 1888-1923 Zimbabwe database using ERNIE LLM

4. **🛡️ Validator Agent** - Detects AI hallucinations through cross-verification between agents, calculating confidence scores using ERNIE LLM

5. **🔧 Repair Advisor Agent** - Analyzes physical damage and generates conservation recommendations with AR-style hotspot visualization using ERNIE LLM

**Key Features:**
- **Agent Theater** - Watch AI agents debate and collaborate in real-time
- **AR Diagnosis Mode** - Interactive overlay showing damage hotspots with treatment recommendations
- **Confidence Markers** - Color-coded indicators showing what's original vs. reconstructed
- **Real-time Streaming** - SSE-powered live agent responses

### How we built it

**Frontend:** React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- Real-time Agent Theater component for visualizing agent collaboration
- AR-style damage hotspot overlay
- Responsive design for desktop and mobile

**Backend:** FastAPI + Python 3.10+
- 5 specialized AI agents using the BaseAgent pattern
- Swarm Orchestrator for sequential agent execution
- Server-Sent Events (SSE) for real-time streaming
- Deduplication cache for low-bandwidth optimization

**AI/ML:**
- **PaddleOCR-VL** (`paddlepaddle/paddleocr-vl`) via Novita AI API for multimodal document OCR
- **ERNIE-4.5** (`baidu/ernie-4.5-8b-chat`) via Novita AI API for agent intelligence
- Custom Doke Shona transliteration mappings
- Historical figure database (Lobengula, Rhodes, Rudd, Jameson, etc.)

**Testing:**
- Property-based testing with Hypothesis (100+ iterations per property)
- Unit tests with pytest
- 20 correctness properties validated

### Challenges we ran into

1. **Doke Shona Character Recognition** - PaddleOCR-VL sometimes misidentified pre-1955 characters. We solved this by adding a specialized Linguist agent that applies rule-based transliteration after OCR.

2. **Hallucination Detection** - Early versions would confidently output incorrect historical facts. We added the Validator agent to cross-check all claims against our historical database.

3. **Real-time Streaming** - Coordinating 5 agents while streaming results to the frontend required careful SSE implementation with proper event formatting.

4. **Low-Bandwidth Optimization** - Many archives are in areas with poor internet. We implemented SHA256-based deduplication caching to avoid re-processing identical documents.

### Accomplishments that we're proud of

- **First multi-agent swarm for African heritage preservation**
- **Transparent AI** - Users can watch agents debate and see confidence levels
- **Doke Shona support** - First system to handle pre-1955 Zimbabwean orthography
- **AR Diagnosis Mode** - Novel visualization for document damage assessment
- **Comprehensive testing** - 20 property-based tests ensuring correctness

### What we learned

- How to effectively combine PaddleOCR-VL's multimodal capabilities with ERNIE's language understanding
- The importance of agent specialization - one general agent couldn't match 5 specialized ones
- Real-time streaming architecture with Server-Sent Events
- Property-based testing for AI systems

### What's next for Nhaka 2.0

1. **Fine-tuned Doke Shona model** - Train a specialized PaddleOCR-VL model on pre-1955 documents
2. **Mobile app** - Bring archive resurrection to field researchers
3. **Multi-language support** - Expand to other African colonial archives (Swahili, Zulu, etc.)
4. **Community archive** - Allow users to contribute and share restored documents
5. **Integration with national archives** - Partner with Zimbabwe National Archives

---

## Built With

- ernie
- paddleocr-vl
- novita-ai
- python
- fastapi
- react
- typescript
- vite
- tailwindcss
- supabase
- hypothesis

---

## Try It Out

- **GitHub Repository**: [YOUR_GITHUB_URL]
- **Demo Video**: [YOUR_YOUTUBE_URL]
- **Live Demo**: [YOUR_DEMO_URL] (optional)

---

## Team

[Your name and any team members]

---

## Prize Categories

Select: **Best ERNIE Multimodal Application (Sponsored by Novita)**

---

## Screenshots to Include

1. Landing page with hero section
2. Agent Theater showing real-time agent collaboration
3. AR Diagnosis Mode with damage hotspots
4. Before/After document comparison
5. Confidence markers on restored text

---

## Video Requirements Checklist

- [ ] Under 5 minutes
- [ ] Shows project functioning
- [ ] Uploaded to YouTube/Vimeo/Youku
- [ ] No copyrighted music
- [ ] No third-party trademarks
- [ ] Clear audio/voiceover

---

Good luck with your submission! 🏆
