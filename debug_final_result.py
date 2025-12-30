#!/usr/bin/env python3
"""
Debug what's actually in the final result
"""
import requests
import json

def debug_final_result():
    url = "https://nhaka-2-0-archive-alive.onrender.com/resurrect/stream"
    
    # Create a simple test image
    from PIL import Image
    import io
    
    img = Image.new('RGB', (400, 200), color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    files = {'file': ('test.png', buffer, 'image/png')}
    
    print("🔍 Debugging final result...")
    
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
                            print("\n🎯 COMPLETION SIGNAL FOUND!")
                            result = data.get('result', {})
                            
                            print(f"\n📊 Full result keys: {list(result.keys())}")
                            
                            # Check each field
                            for key, value in result.items():
                                if isinstance(value, str) and len(value) > 100:
                                    print(f"  {key}: <{len(value)} chars>")
                                elif isinstance(value, list):
                                    print(f"  {key}: [{len(value)} items]")
                                elif isinstance(value, dict):
                                    print(f"  {key}: {{{len(value)} keys}}")
                                else:
                                    print(f"  {key}: {value}")
                            
                            # Specifically check enhanced image
                            enhanced_img = result.get('enhanced_image_base64')
                            if enhanced_img:
                                print(f"\n✅ Enhanced image found: {len(enhanced_img)} chars")
                                print(f"📝 First 50 chars: {enhanced_img[:50]}...")
                                return True
                            else:
                                print(f"\n❌ Enhanced image is: {enhanced_img}")
                                return False
                                
                    except json.JSONDecodeError:
                        continue
                        
        print("❌ No completion signal found!")
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = debug_final_result()
    if success:
        print("\n✅ Enhanced image is in the completion signal!")
    else:
        print("\n❌ Enhanced image missing from completion signal!")