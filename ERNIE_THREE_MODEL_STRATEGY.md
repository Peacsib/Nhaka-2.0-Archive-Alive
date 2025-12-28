# ERNIE Three-Model Strategy for Nhaka 2.0

## Overview
Nhaka 2.0 uses three specialized ERNIE models from Novita AI for optimal document resurrection:

---

## 1. PaddleOCR-VL (0.9B) - Scanner Agent
**Model ID:** `paddlepaddle/paddleocr-vl`

### Purpose
Primary OCR extraction from historical documents

### Key Features
- Ultra-compact 0.9B vision-language model
- SOTA performance on OmniDocBench benchmarks
- Supports 109 languages (including Shona)
- Excels at: text, tables, formulas, charts
- Fast inference with minimal resource consumption

### Usage in Code
```python
# Scanner Agent - Document text extraction
async def _call_paddleocr_vl(self, image_data: bytes):
    response = await client.post(
        "https://api.novita.ai/openai/chat/completions",
        json={
            "model": "paddlepaddle/paddleocr-vl",
            "messages": [...]
        }
    )
```

### Cost
~$0.003 per call (estimated)

---

## 2. ERNIE 4.5 VL 424B A47B - Repair & Enhancement (FLAGSHIP)
**Model ID:** `baidu/ernie-4.5-vl-424b-a47b`

### Purpose
**BEST QUALITY** damage assessment and repair planning

### Key Features
- 424B total parameters, 47B active (MoE architecture)
- Flagship multimodal model - highest quality
- Superior damage detection: foxing, water stains, ink bleed, tears
- Advanced enhancement recommendations
- Competes with GPT-4o Vision at lower cost

### Usage in Code
```python
# Damage analysis with flagship model
async def call_ernie_45_vision_repair(image_base64: str, prompt: str):
    response = await client.post(
        "https://api.novita.ai/v3/openai/chat/completions",
        json={
            "model": "baidu/ernie-4.5-vl-424b-a47b",
            "max_tokens": 600,
            "temperature": 0.2  # Low temp for precision
        }
    )
```

### When to Use
- Document damage assessment
- Repair strategy planning
- Quality enhancement decisions
- Critical restoration analysis

### Cost
~$0.015 per call (higher cost for flagship quality)

---

## 3. ERNIE 4.5 VL 28B A3B Thinking - Agent Reasoning
**Model ID:** `baidu/ernie-4.5-vl-28b-a3b-thinking`

### Purpose
Multi-step reasoning for Linguist, Historian, and Validator agents

### Key Features
- 28B total parameters, 3B active (MoE architecture)
- **THINKING MODE**: Shows reasoning process
- Enhanced multi-step reasoning
- Superior for cultural context and historical analysis
- Optimized for agent collaboration and debate
- Fast inference with deep reasoning

### Usage in Code
```python
# Text-based agent reasoning
async def call_ernie_llm(system_prompt: str, user_input: str):
    response = await client.post(
        "https://api.novita.ai/v3/openai/chat/completions",
        json={
            "model": "baidu/ernie-4.5-vl-28b-a3b-thinking",
            "max_tokens": 200,
            "temperature": 0.7  # Higher for creative reasoning
        }
    )

# Vision-based reasoning (with image)
async def call_ernie_45_vision_thinking(image_base64: str, prompt: str):
    response = await client.post(
        "https://api.novita.ai/v3/openai/chat/completions",
        json={
            "model": "baidu/ernie-4.5-vl-28b-a3b-thinking",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }
            ]
        }
    )
```

### When to Use
- Linguist: Doke Shona transliteration reasoning
- Historian: Colonial context analysis
- Validator: Cross-verification and debate
- Any agent needing multi-step reasoning

### Cost
~$0.003-0.010 per call (depending on text vs vision)

---

## Model Selection Decision Tree

```
Document Processing Flow:
│
├─ Step 1: OCR Extraction
│  └─ Use: PaddleOCR-VL (0.9B)
│     └─ Fast, accurate text extraction
│
├─ Step 2: Damage Assessment
│  └─ Use: ERNIE 4.5 VL 424B (FLAGSHIP)
│     └─ Best quality damage analysis
│
└─ Step 3: Agent Analysis
   └─ Use: ERNIE 4.5 VL 28B Thinking
      ├─ Linguist: Transliteration reasoning
      ├─ Historian: Cultural context
      └─ Validator: Cross-verification
```

---

## Cost Optimization

### Budget Tracking
```python
api_tracker = APIUsageTracker()
api_tracker.daily_budget_usd = 5.0  # Set in .env

# Before each call
if not api_tracker.can_spend(estimated_cost):
    print("Budget exceeded")
    return None

# After each call
api_tracker.record(model, input_tokens, output_tokens, cost)
```

### Cost Estimates (per document)
- Scanner (PaddleOCR): $0.003
- Repair Analysis (424B): $0.015
- 3x Agent Reasoning (28B): $0.009
- **Total per document**: ~$0.027

---

## Performance Characteristics

| Model | Params | Active | Speed | Quality | Use Case |
|-------|--------|--------|-------|---------|----------|
| PaddleOCR-VL | 0.9B | 0.9B | ⚡⚡⚡ | ⭐⭐⭐⭐ | OCR |
| ERNIE 424B | 424B | 47B | ⚡ | ⭐⭐⭐⭐⭐ | Repair |
| ERNIE 28B Thinking | 28B | 3B | ⚡⚡ | ⭐⭐⭐⭐ | Reasoning |

---

## Environment Variables

```bash
# .env file
NOVITA_AI_API_KEY=your_api_key_here
DAILY_API_BUDGET=5.0
```

---

## Testing the Models

```bash
# Test PaddleOCR-VL
curl -X POST "https://api.novita.ai/openai/chat/completions" \
  -H "Authorization: Bearer $NOVITA_AI_API_KEY" \
  -d '{"model": "paddlepaddle/paddleocr-vl", "messages": [...]}'

# Test ERNIE 424B
curl -X POST "https://api.novita.ai/v3/openai/chat/completions" \
  -H "Authorization: Bearer $NOVITA_AI_API_KEY" \
  -d '{"model": "baidu/ernie-4.5-vl-424b-a47b", "messages": [...]}'

# Test ERNIE 28B Thinking
curl -X POST "https://api.novita.ai/v3/openai/chat/completions" \
  -H "Authorization: Bearer $NOVITA_AI_API_KEY" \
  -d '{"model": "baidu/ernie-4.5-vl-28b-a3b-thinking", "messages": [...]}'
```

---

## Key Advantages

1. **Specialized Models**: Each model optimized for its specific task
2. **Cost Efficient**: Use expensive 424B only for critical repair analysis
3. **Quality Balance**: 28B Thinking provides excellent reasoning at moderate cost
4. **Speed**: PaddleOCR-VL handles fast OCR extraction
5. **Thinking Mode**: 28B Thinking shows reasoning process for transparency

---

## Next Steps

1. ✅ Models configured in `main.py`
2. ✅ Three-model strategy implemented
3. ✅ Cost tracking enabled
4. 🔄 Test with real historical documents
5. 🔄 Monitor API usage and costs
6. 🔄 Fine-tune temperature and token limits based on results
