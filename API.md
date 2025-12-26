<div align="center">

# 📡 Nhaka 2.0 API Documentation

**RESTful API • Server-Sent Events • Multi-Agent Processing**

[![API Version](https://img.shields.io/badge/API_Version-2.0-blue?style=for-the-badge)](/)
[![Powered By](https://img.shields.io/badge/Powered_By-Novita_AI-black?style=for-the-badge&logo=ai)](https://novita.ai)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

</div>

---

## 📋 Table of Contents
- [Getting Started](#-getting-started)
- [Authentication](#-authentication)
- [Endpoints](#-endpoints)
  - [Core Operations](#core-operations)
  - [Management](#management)
  - [Archives](#archives)
- [Data Models](#-data-models)
- [Error Handling](#-error-handling)
- [Rate Limits & Costs](#-rate-limits--costs)
- [Testing](#-testing)
- [Support](#-support)

---

## 🚀 Getting Started

### Base URL
```
http://localhost:8000
```

### Quick Test
```bash
# Check API status
curl http://localhost:8000/

# Upload a document
curl -X POST http://localhost:8000/resurrect/stream \
  -F "file=@your-document.jpg" \
  --no-buffer
```

---

## 🔐 Authentication

Add your Novita AI API key to `.env`:

```bash
# .env file
NOVITA_AI_API_KEY=your_key_here_from_novita_dashboard
DAILY_API_BUDGET=5.00  # Optional: default is $5.00 USD
```

> **Get your API key:** [Novita AI Dashboard](https://novita.ai/dashboard/key)  
> **Free tier:** 100 requests/day

---

## 📡 Endpoints

### Core Operations

#### 1. Health Check
<details>
<summary><code>GET /</code> - Check API status and available endpoints</summary>

**Response:**
```json
{
  "status": "Archive Alive API - Operational",
  "version": "2.0",
  "agents": [
    "Scanner", 
    "Linguist", 
    "Historian", 
    "Validator", 
    "Physical Repair Advisor"
  ],
  "endpoints": {
    "resurrect_stream": "/resurrect/stream (POST) - SSE streaming",
    "resurrect_lite": "/resurrect/lite (POST) - Cost-optimized OCR",
    "resurrect_cached": "/resurrect/cached (POST) - Full with caching",
    "api_stats": "/api/stats (GET) - Usage statistics",
    "api_budget": "/api/budget (POST) - Set daily budget"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/
```
</details>

---

#### 2. Document Resurrection (Streaming) 🔥
<details>
<summary><code>POST /resurrect/stream</code> - Real-time multi-agent processing with SSE</summary>

**Best For:** Interactive UI with live agent updates

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** `file` - Image file (PNG, JPG, JPEG)

**Response:** Server-Sent Events stream

**Event Types:**

| Event | Description |
|-------|-------------|
| `agent` | Agent progress update |
| `complete` | Final result with full data |

**Agent Event Format:**
```json
{
  "agent": "scanner",
  "message": "🔬 Initializing PaddleOCR-VL forensic scan...",
  "confidence": 85,
  "document_section": "Image Analysis",
  "is_debate": false,
  "timestamp": "2025-12-25T10:30:00Z",
  "metadata": {}
}
```

**Complete Event Format:**
```json
{
  "type": "complete",
  "cached": false,
  "result": {
    "overall_confidence": 87,
    "processing_time_ms": 5234,
    "raw_ocr_text": "Original extracted text...",
    "transliterated_text": "Modernized readable text...",
    "archive_id": "uuid-here",
    "enhanced_image_base64": "base64-encoded-image",
    "repair_recommendations": [...],
    "damage_hotspots": [...],
    "restoration_summary": {...}
  }
}
```

**Examples:**

<table>
<tr>
<td><b>curl</b></td>
</tr>
<tr>
<td>

```bash
curl -X POST http://localhost:8000/resurrect/stream \
  -F "file=@document.jpg" \
  --no-buffer
```

</td>
</tr>
<tr>
<td><b>JavaScript (EventSource)</b></td>
</tr>
<tr>
<td>

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/resurrect/stream', {
  method: 'POST',
  body: formData
}).then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  reader.read().then(function processText({ done, value }) {
    if (done) return;
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        console.log(data.agent, data.message);
      }
    });
    
    return reader.read().then(processText);
  });
});
```

</td>
</tr>
<tr>
<td><b>Python (requests + streaming)</b></td>
</tr>
<tr>
<td>

```python
import requests
import json

with open('document.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/resurrect/stream',
        files={'file': f},
        stream=True
    )
    
    for line in response.iter_lines():
        if line.startswith(b'data: '):
            data = json.loads(line[6:])
            print(f"{data['agent']}: {data['message']}")
```

</td>
</tr>
</table>

**Cost:** ~$0.03-0.04 per document

</details>

---

#### 3. Document Resurrection (Lite) ⚡
<details>
<summary><code>POST /resurrect/lite</code> - Fast OCR-only processing without AI agents</summary>

**Best For:** Quick text extraction without analysis

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** `file` - Image file (PNG, JPG, JPEG)

**Response:**
```json
{
  "cached": false,
  "cost": "~$0.01",
  "raw_ocr_text": "Extracted text...",
  "ocr_confidence": 78,
  "enhanced_image_base64": "base64-encoded-image",
  "document_analysis": {
    "type": "colonial_letter",
    "confidence": 85,
    "characteristics": ["handwritten", "aged_paper"]
  },
  "processing_messages": [
    "🔬 Initializing PaddleOCR-VL...",
    "📝 OCR extraction complete",
    "✓ Processing finished"
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/resurrect/lite \
  -F "file=@document.jpg"
```

**Cost:** ~$0.01 per document

</details>

---

#### 4. Document Resurrection (Cached) 💾
<details>
<summary><code>POST /resurrect/cached</code> - Full processing with SHA256 caching</summary>

**Best For:** Repeated processing of same documents (FREE after first request)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** `file` - Image file (PNG, JPG, JPEG)

**Response:**
```json
{
  "cached": false,
  "cache_hash": "a1b2c3d4e5f6g7h8",
  "cost": "~$0.03-0.04",
  "result": {
    "overall_confidence": 87,
    "raw_ocr_text": "...",
    "transliterated_text": "...",
    "repair_recommendations": [...],
    "damage_hotspots": [...]
  },
  "message": "Result cached - next request for this image will be FREE"
}
```

**Cache Behavior:**
- First request: ~$0.03-0.04 (full processing)
- Subsequent requests: **FREE** (instant retrieval)
- Cache key: SHA256 hash of image

**Example:**
```bash
# First upload - full processing
curl -X POST http://localhost:8000/resurrect/cached \
  -F "file=@document.jpg"

# Second upload (same file) - instant, FREE
curl -X POST http://localhost:8000/resurrect/cached \
  -F "file=@document.jpg"
```

</details>

---

### Management

#### 5. API Usage Statistics 📊
<details>
<summary><code>GET /api/stats</code> - Get current API usage and cost tracking</summary>

**Response:**
```json
{
  "api_usage": {
    "today_spend": 0.12,
    "budget_remaining": 4.88,
    "total_calls_today": 4,
    "budget_percent_used": 2.4
  },
  "cache_performance": {
    "cache_size": 15,
    "hits": 8,
    "misses": 12,
    "hit_rate_percent": 40.0,
    "bandwidth_saved_estimate": "20MB"
  },
  "cost_savings": {
    "from_cache": "$0.24",
    "cache_hit_rate": "40.0%",
    "recommendation": "Enable caching for repeated documents"
  },
  "tips": [
    "Use /resurrect/lite for quick OCR (~$0.01)",
    "Use /resurrect/cached for full processing with caching",
    "Set DAILY_API_BUDGET env var to control spending"
  ]
}
```

**Example:**
```bash
curl http://localhost:8000/api/stats
```

</details>

---

#### 6. Set API Budget 💰
<details>
<summary><code>POST /api/budget</code> - Set daily API spending limit</summary>

**Request:**
```json
{
  "budget_usd": 10.0
}
```

**Response:**
```json
{
  "message": "Daily budget set to $10.00",
  "current_spend": 0.12,
  "remaining": 9.88
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/budget \
  -H "Content-Type: application/json" \
  -d '{"budget_usd": 10.0}'
```

</details>

---

### Archives

#### 7. Get Archived Document 🗄️
<details>
<summary><code>GET /archives/{archive_id}</code> - Retrieve previously processed document from Supabase</summary>

**Response:**
```json
{
  "id": "uuid-here",
  "original_filename": "document.jpg",
  "raw_ocr_text": "...",
  "resurrected_text": "...",
  "overall_confidence": 87,
  "processing_time_ms": 5234,
  "created_at": "2025-12-25T10:30:00Z"
}
```

**Example:**
```bash
curl http://localhost:8000/archives/123e4567-e89b-12d3-a456-426614174000
```

</details>

---

#### 8. List Available Agents 🤖
<details>
<summary><code>GET /agents</code> - Get information about all AI agents</summary>

**Response:**
```json
{
  "agents": [
    {
      "type": "scanner",
      "name": "Scanner Agent",
      "description": "PaddleOCR-VL multimodal document analyzer",
      "model": "paddlepaddle/paddleocr-vl",
      "capabilities": [
        "OCR extraction",
        "Ink degradation detection",
        "Doke character recognition"
      ]
    },
    {
      "type": "linguist",
      "name": "Linguist Agent",
      "description": "Doke Shona orthography expert (1931-1955)",
      "model": "baidu/ernie-4.5-8b-chat",
      "capabilities": [
        "Pre-1955 Shona transliteration",
        "Historical terminology mapping"
      ]
    }
    // ... more agents
  ]
}
```

**Example:**
```bash
curl http://localhost:8000/agents
```

</details>

---

## 📦 Data Models

### ResurrectionResult
```typescript
interface ResurrectionResult {
  overall_confidence: number;        // 0-100
  processing_time_ms: number;
  raw_ocr_text: string;
  transliterated_text: string;
  archive_id?: string;
  enhanced_image_base64?: string;
  repair_recommendations?: RepairRecommendation[];
  damage_hotspots?: DamageHotspot[];
  restoration_summary?: RestorationSummary;
}
```

### RepairRecommendation
```typescript
interface RepairRecommendation {
  issue: string;
  severity: "critical" | "moderate" | "minor";
  treatment: string;
  estimated_cost_usd: number;
  urgency: "immediate" | "soon" | "routine";
}
```

### DamageHotspot
```typescript
interface DamageHotspot {
  x: number;              // Percentage (0-100)
  y: number;              // Percentage (0-100)
  radius: number;         // Percentage (0-100)
  severity: "critical" | "moderate" | "minor";
  damage_type: string;
  description: string;
}
```

### RestorationSummary
```typescript
interface RestorationSummary {
  document_type: string;
  detected_issues: string[];
  enhancements_applied: string[];
  quality_score: number;
  skew_corrected: boolean;
  shadows_removed: boolean;
  yellowing_fixed: boolean;
  text_structure?: {
    headings: Array<{y_start: number, y_end: number}>;
    paragraphs: Array<{y_start: number, y_end: number}>;
  };
  image_regions_count: number;
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | Request processed successfully |
| `400` | Bad Request | Invalid file format |
| `404` | Not Found | Archive ID doesn't exist |
| `429` | Too Many Requests | Daily budget exceeded |
| `500` | Internal Server Error | API processing error |

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Errors

<details>
<summary><b>400 - Bad Request</b></summary>

```json
{
  "detail": "File must be an image (PNG, JPG, JPEG)"
}
```

**Causes:**
- Uploaded non-image file
- File too large (>10MB)
- Corrupted image file

</details>

<details>
<summary><b>404 - Not Found</b></summary>

```json
{
  "detail": "Archive not found"
}
```

**Causes:**
- Invalid archive UUID
- Archive expired/deleted

</details>

<details>
<summary><b>429 - Budget Exceeded</b></summary>

```json
{
  "detail": "Daily API budget of $5.00 exceeded. Current spend: $5.12"
}
```

**Solution:** Increase budget via `POST /api/budget` or wait until tomorrow

</details>

<details>
<summary><b>500 - Internal Server Error</b></summary>

```json
{
  "detail": "Novita API error: Model inference failed"
}
```

**Causes:**
- Novita API downtime
- Invalid API key
- Network issues

</details>

---

## 💵 Rate Limits & Costs

### Daily Budget
- **Default:** $5.00 USD
- **Configurable:** Via `DAILY_API_BUDGET` env var or `/api/budget` endpoint
- **Behavior:** API returns `429` when budget exceeded

### Cost Per Document

| Endpoint | Cost | Use Case |
|----------|------|----------|
| `/resurrect/lite` | ~$0.01 | Quick OCR extraction |
| `/resurrect/stream` | ~$0.03-0.04 | Full multi-agent analysis |
| `/resurrect/cached` | $0.03-0.04 (first)<br/>**FREE** (repeat) | Repeated documents |

### Cost Optimization Tips

💡 **Use caching** - Save ~$0.03 per repeated document  
💡 **Use lite mode** - 3x cheaper for basic OCR  
💡 **Batch similar documents** - Cache hit rate improves  
💡 **Monitor `/api/stats`** - Track spending in real-time  

---

## 🧪 Testing

### Interactive API Docs
FastAPI provides auto-generated interactive documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Command Line Testing

```bash
# Health check
curl http://localhost:8000/

# Upload document (lite mode)
curl -X POST http://localhost:8000/resurrect/lite \
  -F "file=@test-document.jpg"

# Upload document (streaming)
curl -X POST http://localhost:8000/resurrect/stream \
  -F "file=@test-document.jpg" \
  --no-buffer

# Check API stats
curl http://localhost:8000/api/stats

# Set budget
curl -X POST http://localhost:8000/api/budget \
  -H "Content-Type: application/json" \
  -d '{"budget_usd": 10.0}'
```

### Python Testing

```python
import requests

# Upload document
with open('document.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/resurrect/lite',
        files={'file': f}
    )
    print(response.json())

# Get API stats
stats = requests.get('http://localhost:8000/api/stats').json()
print(f"Budget used: {stats['api_usage']['budget_percent_used']}%")
```

### Postman Collection

> **Coming Soon:** Download our Postman collection for one-click API testing

---

## 📞 Support

### Documentation
- **Main README:** [Project Overview](README.md)
- **Architecture:** [Technical Design](ARCHITECTURE.md)
- **Contributing:** [Development Guide](CONTRIBUTING.md)

### Get Help
- **GitHub Issues:** [Report a bug](https://github.com/Peacsib/Nhaka-2.0-Archive-Alive/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/Peacsib/Nhaka-2.0-Archive-Alive/discussions)
- **Email:** peacesibx@gmail.com

### API Status
Check real-time API status: `GET http://localhost:8000/`

---

<div align="center">

## 🏛️ Built for Cultural Heritage Preservation

**Every API call helps save irreplaceable historical documents**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Novita AI](https://img.shields.io/badge/Novita_AI-000000?style=for-the-badge&logo=ai&logoColor=white)](https://novita.ai)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)

**[← Back to Main README](README.md)** | **[View Architecture](ARCHITECTURE.md)** | **[Contributing Guide](CONTRIBUTING.md)**

</div>
```

---

