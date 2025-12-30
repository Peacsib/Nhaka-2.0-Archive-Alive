#!/usr/bin/env python3
"""
Quick test to see what the completion response actually contains
"""
import requests
import json

def test_completion_response():
    # Test with a simple image
    url = "https://nhaka-2-0-archive-alive.onrender.com/resurrect/stream"
    
    # Create a simple test image
    from PIL import Image
    import io
    
    # Create a simple test image with text
    img = Image.new('RGB', (400, 200), color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {'file': ('test.png', buffer, 'image/png')}
    
    print("🔍 Testing completion response...")
    
    try:
        response = requests.post(url, files=files, stream=True)
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            return
            
        print("✅ Connected to stream")
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    try:
                        data = json.loads(line_str[6:])
                        
                        if data.get('type') == 'complete':
                            print("\n🎯 COMPLETION SIGNAL RECEIVED:")
                            result = data.get('result', {})
                            
                            print(f"📊 Result keys: {list(result.keys())}")
                            
                            enhanced_img = result.get('enhanced_image_base64')
                            if enhanced_img:
                                print(f"🖼️  Enhanced image: {len(enhanced_img)} chars")
                            else:
                                print("❌ No enhanced_image_base64 found!")
                                
                            # Check all text fields
                            for key in ['restored_text', 'transliterated_text', 'raw_ocr_text']:
                                text_val = result.get(key)
                                if text_val:
                                    print(f"📝 {key}: {len(text_val)} chars - '{text_val[:50]}...'")
                                else:
                                    print(f"❌ No {key} found!")
                                    
                            print(f"\n🔍 Full result structure:")
                            for k, v in result.items():
                                if isinstance(v, str) and len(v) > 100:
                                    print(f"  {k}: <{len(v)} chars>")
                                else:
                                    print(f"  {k}: {v}")
                                
                            break
                            
                    except json.JSONDecodeError:
                        continue
                        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_completion_response()