# 🎬 Nhaka 2.0 Demo Video Script

**Duration**: 4-5 minutes  
**Format**: Screen recording with voiceover

---

## 📋 Pre-Recording Checklist

- [ ] Backend running: `uvicorn main:app --reload --port 8000`
- [ ] Frontend running: `npm run dev`
- [ ] Browser at http://localhost:8089
- [ ] Sample documents ready in `src/assets/`
- [ ] Novita AI API key configured
- [ ] Screen recording software ready (OBS, Loom, etc.)

---

## 🎥 Video Script

### **[0:00 - 0:30] Opening Hook**

**VISUAL**: Show a faded, damaged historical document

**VOICEOVER**:
> "Two billion people risk losing their family histories as historical documents fade into illegibility. In Zimbabwe, colonial-era archives from 1888 to 1923 are deteriorating daily. Traditional OCR fails on damaged documents, handwritten scripts, and pre-1955 Shona characters.
>
> Introducing Nhaka 2.0 - Archive Resurrection. A multi-agent AI system that brings faded documents back to life."

---

### **[0:30 - 1:00] Technology Introduction**

**VISUAL**: Show the architecture diagram or agent icons

**VOICEOVER**:
> "Nhaka uses five specialized AI agents powered by Baidu's ERNIE and PaddleOCR-VL through Novita AI:
>
> - The Scanner agent uses PaddleOCR-VL for multimodal document analysis
> - The Linguist transliterates pre-1955 Doke Shona to modern script
> - The Historian verifies facts against our 1888-1923 database
> - The Validator catches AI hallucinations through cross-verification
> - And the Repair Advisor recommends physical conservation treatments
>
> Let me show you how it works."

---

### **[1:00 - 2:30] Live Demo - Document Upload & Agent Theater**

**VISUAL**: Navigate to the Resurrect page, upload a document

**VOICEOVER**:
> "Here's our main interface. I'll upload a historical document - this is an actual colonial-era letter from 1888.
>
> Watch the Agent Theater on the right. You can see each agent working in real-time..."

**ACTION**: Upload `BSAC_Archive_Record_1896.png` or `Colonial_Certificate_1957.jpg`

**VOICEOVER** (as agents process):
> "The Scanner is extracting text using PaddleOCR-VL... it's detecting iron-gall ink degradation and identifying Doke orthography characters.
>
> Now the Linguist is transliterating the pre-1955 Shona characters to modern equivalents...
>
> The Historian is cross-referencing names and dates - look, it found references to Lobengula and the Rudd Concession of 1888.
>
> The Validator is checking for inconsistencies and hallucinations... it's calculating a final confidence score.
>
> Finally, the Repair Advisor is analyzing physical damage and generating conservation recommendations."

---

### **[2:30 - 3:15] AR Diagnosis Mode**

**VISUAL**: Toggle AR mode, show damage hotspots

**VOICEOVER**:
> "One of our unique features is AR Diagnosis Mode. Let me toggle it on...
>
> See these colored hotspots? Each one represents a damaged area on the document:
> - Red indicates critical damage like iron-gall ink corrosion
> - Yellow shows moderate issues like foxing or water stains
> - Green marks minor problems like fading
>
> Hover over any hotspot to see the recommended treatment and estimated restoration cost. This helps archivists prioritize which documents need immediate attention."

---

### **[3:15 - 3:45] Results & Confidence Markers**

**VISUAL**: Show the restored text with confidence indicators

**VOICEOVER**:
> "Here's the restored document. Notice the confidence markers:
> - Green text is high confidence - we're very sure this is accurate
> - Yellow indicates medium confidence - some uncertainty
> - Red shows low confidence sections that need human review
>
> You can compare the original OCR text with the restored version side by side. The system clearly shows what was reconstructed versus what was clearly readable."

---

### **[3:45 - 4:15] Technical Highlights**

**VISUAL**: Show code snippets or architecture diagram

**VOICEOVER**:
> "Under the hood, Nhaka 2.0 uses:
> - PaddleOCR-VL via Novita AI for multimodal document understanding
> - ERNIE LLM for each specialized agent's intelligence
> - Server-Sent Events for real-time streaming
> - A deduplication cache for low-bandwidth environments
> - Property-based testing with Hypothesis for code quality
>
> The entire system is open source and designed to be deployed anywhere."

---

### **[4:15 - 4:45] Impact & Closing**

**VISUAL**: Show before/after comparison, then logo

**VOICEOVER**:
> "Nhaka 2.0 isn't just about technology - it's about preserving human heritage. Every document we resurrect is a story saved, a family history preserved, a piece of culture protected.
>
> With ERNIE and PaddleOCR-VL, we're bringing the past back to life - transparently, accurately, and accessibly.
>
> Nhaka 2.0 - because every story deserves to be remembered.
>
> Thank you for watching."

**VISUAL**: End card with:
- Project name: Nhaka 2.0
- GitHub URL
- "Built for ERNIE AI Developer Challenge 2025"
- Baidu/Novita AI logos

---

## 🎯 Key Points to Emphasize

1. **Multi-Agent Architecture** - 5 specialized agents, not just one model
2. **PaddleOCR-VL + ERNIE Synergy** - Multimodal OCR + LLM intelligence
3. **Transparency** - Agent Theater shows AI reasoning in real-time
4. **Cultural Impact** - Preserving African heritage specifically
5. **Practical Features** - AR diagnosis, confidence markers, conservation recommendations
6. **Novita AI Integration** - Using their API for both PaddleOCR-VL and ERNIE

---

## 📝 Recording Tips

1. **Speak slowly and clearly** - Judges may not be native English speakers
2. **Pause on key features** - Let viewers see the Agent Theater in action
3. **Show real documents** - Use the sample documents in `src/assets/`
4. **Keep it under 5 minutes** - Judges won't watch beyond that
5. **End with impact** - Emotional connection to heritage preservation

---

## 🎵 Music Suggestions (Royalty-Free)

- Soft, inspiring background music
- African-inspired instrumental (optional)
- Keep volume low so voiceover is clear

---

Good luck with your recording! 🎬
