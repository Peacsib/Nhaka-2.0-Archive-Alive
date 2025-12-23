# Nhaka

**Five AI agents. One mission. Resurrect the unreadable.**

---

My grandmother kept letters from 1923. By the time I found them, the ink had faded to ghosts. Traditional OCR returned gibberish. AI chatbots hallucinated names that never existed.

So I built Nhaka.

*Nhaka* means "heritage" in Shona. It's a multi-agent system where five specialized AIs argue, verify, and collaborate to bring damaged documents back to life—and you can watch them do it.

---

## What Makes This Different

Most document restoration tools are black boxes. Upload → wait → hope for the best.

Nhaka shows you everything. Five agents with distinct personalities debate in real-time:

| Agent | Job | What You'll See |
|-------|-----|-----------------|
| **Scanner** | Reads the image | "I'm 73% confident this word is 'Lobengula'" |
| **Linguist** | Handles old scripts | "That's Doke Shona orthography—let me transliterate" |
| **Historian** | Fact-checks | "Wait, Lobengula died in 1894. This date doesn't match." |
| **Validator** | Catches hallucinations | "Scanner and Historian disagree. Flagging for review." |
| **Repair Advisor** | Assesses damage | "Water damage in top-left. Recommend deacidification." |

You watch them think. You see when they disagree. You know exactly what's original text versus AI reconstruction.

---

## The Tech

**Vision:** PaddleOCR-VL via Novita AI  
**Language:** ERNIE 4.5 via Novita AI  
**Frontend:** React + TypeScript + Vite  
**Backend:** FastAPI with SSE streaming  
**Testing:** Property-based tests with Hypothesis

The agents stream their responses in real-time. No loading spinners. No waiting. Character by character, you watch the document come back to life.

---

## Try It

```bash
# Clone
git clone https://github.com/Peacsib/nhaka-archive-resurrection.git
cd nhaka-archive-resurrection

# Install
npm install
pip install -r requirements.txt

# Configure (get a free key at novita.ai)
cp .env.example .env
# Add your NOVITA_AI_API_KEY

# Run
uvicorn main:app --reload --port 8000  # Terminal 1
npm run dev                             # Terminal 2
```

Open http://localhost:8089. Upload a document. Watch the agents work.

---

## Why ERNIE?

I needed two things: vision that could read faded handwriting, and language models smart enough to fact-check historical claims.

PaddleOCR-VL handles the vision—it's trained on degraded documents and handles the mess of water stains, foxing, and ink bleed better than alternatives I tested.

ERNIE 4.5 powers the four language agents. Each has a different system prompt, different expertise, different personality. They argue. They verify each other. They catch mistakes.

The combination—multimodal vision feeding into specialized language agents—is what makes this work.

---

## The Architecture

```
Document Image
      ↓
┌─────────────────────────────────────────────┐
│           PaddleOCR-VL (Scanner)            │
│     Extracts text + detects damage          │
└─────────────────────────────────────────────┘
      ↓ SSE Stream
┌─────────────────────────────────────────────┐
│              ERNIE 4.5 Agents               │
│  Linguist → Historian → Validator → Repair  │
│     Each agent sees previous outputs        │
└─────────────────────────────────────────────┘
      ↓ SSE Stream
┌─────────────────────────────────────────────┐
│              React Frontend                 │
│   Agent Theater • AR Damage View • Export   │
└─────────────────────────────────────────────┘
```

Every agent streams to the frontend. You see Scanner's OCR results appear, then Linguist's transliteration, then Historian's fact-check, then Validator's confidence assessment, then Repair Advisor's conservation notes.

It takes about 5 seconds total. But you're watching the whole time.

---

## What I Learned

Building this taught me that transparency matters more than accuracy. Users trust AI more when they can see it thinking—even when it makes mistakes.

The multi-agent approach also catches errors that single-model systems miss. When Historian says "this date is wrong" and Validator flags the disagreement, users know to double-check. That's better than confidently wrong.

---

## For the Judges

**Category:** Best ERNIE Multimodal Application (Sponsored by Novita)

This project demonstrates:
- **Multimodal integration:** PaddleOCR-VL vision + ERNIE 4.5 language working together
- **Novel architecture:** Multi-agent swarm with real-time streaming collaboration
- **Real-world impact:** Document preservation is a genuine problem affecting archives worldwide
- **Technical depth:** Property-based testing, SSE streaming, caching, confidence scoring
- **Polish:** Working frontend, working backend, working demo

---

## Links

- **Live Demo:** [Coming Soon]
- **Demo Video:** [Coming Soon]
- **GitHub:** https://github.com/Peacsib

---

## Contact

Peace Sibanda  
peacesibx@gmail.com  
[LinkedIn](https://www.linkedin.com/in/peace-sibanda) • [GitHub](https://github.com/Peacsib)

---

*Built for the ERNIE AI Developer Challenge 2025*
