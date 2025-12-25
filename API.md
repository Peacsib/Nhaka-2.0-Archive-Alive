# 📡 API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Add your Novita AI API key to `.env`:
```bash
NOVITA_AI_API_KEY=your_key_here
```

---

## Endpoints

### 1. Health Check
**GET** `/`

Returns API status and available endpoints.

**Response:**
```json
{
  "status": "Archive Alive API - Operational",
  "version": "2.0",
  "agents": ["Scanner", "Linguist", "Historian", "Validator", "Physical Repair Advisor"],
  "endpoints": {
    "resurrect_stream": "/resurrect/stream (POST) - SSE streaming resurrection",
    "resurrect_lite": "/resurrect/lite (POST) - Cost-optimized (OCR only)",
    "resurrect_cached": "/resurrect/cached (POST) - Full with caching",
    "api_stats": "/api/stats (GET) - API usage and cost stats",
    "api_budget": "/api/budget (POST) - Set daily budget"
  }
}
```

---

### 2. Document Resurrection (Streaming)
**POST** `/resurrect/stream`

Upload a document and receive real-time agent updates via Server-Sent Events.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** 
  - `file`: Image file (PNG, JPG, JPEG)

**Response:** Server-Sent Events stream

**Event Format:**
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

**Final Event:**
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

**Example (curl):**
```bash
curl -X POST http://localhost:8000/resurrect/stream \
  -F "file=@document.jpg" \
  --no-buffer
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const eventSource = new EventSource('/resurrect/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.agent, data.message);
};
```

---

### 3. Document Resurrection (Lite)
**POST** `/resurrect/lite`

Fast OCR-only processing without AI agents. Cost: ~$0.01/document.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** 
  - `file`: Image file (PNG, JPG, JPEG)

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

---

### 4. Document Resurrection (Cached)
**POST** `/resurrect/cached`

Full processing with caching. First request: ~$0.03, subsequent: FREE.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** 
  - `file`: Image file (PNG, JPG, JPEG)

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

---

### 5. API Usage Statistics
**GET** `/api/stats`

Get current API usage and cost tracking.

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
    "recommendation": "Enable caching for repeated documents to save ~$0.03/doc"
  },
  "tips": [
    "Use /resurrect/lite for quick OCR-only processing (~$0.01)",
    "Use /resurrect/cached for full processing with caching",
    "Set DAILY_API_BUDGET env var to control spending"
  ]
}
```

---

### 6. Set API Budget
**POST** `/api/budget`

Set daily API spending limit.

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

---

### 7. Get Archived Document
**GET** `/archives/{archive_id}`

Retrieve a previously processed document from Supabase.

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

---

### 8. List Available Agents
**GET** `/agents`

Get information about all available AI agents.

**Response:**
```json
{
  "agents": [
    {
      "type": "scanner",
      "name": "Scanner Agent",
      "description": "PaddleOCR-VL multimodal document analyzer via Novita API",
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
      "capabilities": [
        "Pre-1955 Shona transliteration",
        "Historical terminology mapping"
      ]
    }
    // ... more agents
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "File must be an image"
}
```

### 404 Not Found
```json
{
  "detail": "Archive not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

---

## Rate Limits

- **Default daily budget:** $5.00 USD
- **Cost per document:**
  - Lite: ~$0.01
  - Full: ~$0.03-0.04
  - Cached: $0.00 (after first request)

---

## Data Models

### ResurrectionResult
```typescript
{
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
{
  issue: string;
  severity: "critical" | "moderate" | "minor";
  treatment: string;
  estimated_cost_usd: number;
  urgency: "immediate" | "soon" | "routine";
}
```

### DamageHotspot
```typescript
{
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
{
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

## Testing

### Test with curl
```bash
# Health check
curl http://localhost:8000/

# Upload document (streaming)
curl -X POST http://localhost:8000/resurrect/stream \
  -F "file=@test-document.jpg" \
  --no-buffer

# Get API stats
curl http://localhost:8000/api/stats
```

### Test with Python
```python
import requests

# Upload document
with open('document.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/resurrect/lite',
        files={'file': f}
    )
    print(response.json())
```

---

## Support

For issues or questions:
- **GitHub Issues:** [Report a bug](https://github.com/Peacsib/Nhaka-2.0-Archive-Alive/issues)
- **Email:** peacesibx@gmail.com
