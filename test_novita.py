#!/usr/bin/env python3
"""
Test Novita API integration for PaddleOCR-VL
"""
import asyncio
import base64
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

async def test_novita_api():
    """Test Novita API connection"""
    api_key = os.getenv("NOVITA_AI_API_KEY")
    
    if not api_key:
        print("❌ No API key found in .env")
        return
    
    print(f"🔑 API Key loaded: {api_key[:20]}...")
    
    # Create a simple test image with text (100x30 white image with "Hello" - minimal valid image)
    # Using a small but valid PNG that the OCR can process
    from PIL import Image, ImageDraw
    import io
    
    # Create a simple image with text
    img = Image.new('RGB', (200, 50), color='white')
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), "Hello World Test", fill='black')
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    test_image_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    try:
        # Increased timeout for vision model processing
        timeout = httpx.Timeout(120.0, connect=30.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            print("🚀 Testing Novita API connection (this may take a minute)...")
            
            response = await client.post(
                "https://api.novita.ai/openai/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "paddlepaddle/paddleocr-vl",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Extract any text from this image."
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/png;base64,{test_image_b64}"}
                                }
                            ]
                        }
                    ],
                    "max_tokens": 1000
                }
            )
            
            print(f"📡 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Novita API connection successful!")
                print(f"📝 Response: {data}")
                return True
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_novita_api())