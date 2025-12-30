#!/usr/bin/env python3
"""
Debug Browser Console - Test completion signal in real-time
This will help us see exactly what's happening in the browser console.
"""
import asyncio
import httpx
import json
import base64
from PIL import Image, ImageDraw
import io

async def test_completion_signal():
    """Test the completion signal and debug what should appear in browser console"""
    
    print("🔍 BROWSER CONSOLE DEBUG TEST")
    print("=" * 50)
    
    # Create a simple test image
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 80), "Test Document", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    print("📤 Sending test document to API...")
    
    try:
        # Save image to bytes for file upload
        buffer.seek(0)
        image_bytes = buffer.getvalue()
        
        # Use the correct API endpoint and method
        api_url = "https://nhaka-2-0-archive-alive.onrender.com/resurrect/stream"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": ("test.png", image_bytes, "image/png")}
            response = await client.post(api_url, files=files)
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ API Error: {response.text}")
                return
            
            print("\n🔄 Processing stream events...")
            print("=" * 50)
            
            completion_found = False
            enhanced_image_found = False
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        event_type = data.get("type", "unknown")
                        
                        print(f"📨 Event: {event_type}")
                        
                        if event_type == "complete":
                            completion_found = True
                            result = data.get("result", {})
                            
                            print("\n🎯 COMPLETION SIGNAL RECEIVED!")
                            print("=" * 30)
                            print("This is what should appear in your browser console:")
                            print()
                            print("🎯 COMPLETION SIGNAL RECEIVED!")
                            print("📊 Complete data:", json.dumps(data, indent=2)[:200] + "...")
                            print("✅ Setting isComplete = true")
                            
                            if result.get("enhanced_image_base64"):
                                enhanced_image_found = True
                                img_len = len(result["enhanced_image_base64"])
                                print(f"✅ Setting enhanced image: {img_len} chars")
                            else:
                                print("❌ No enhanced_image_base64 found!")
                            
                            print("\n📋 DocumentPreview props:")
                            print(f"  isComplete: true")
                            print(f"  hasEnhancedImage: {enhanced_image_found}")
                            print(f"  enhancedImageLength: {img_len if enhanced_image_found else 0}")
                            
                            if enhanced_image_found:
                                print("\n🔄 Auto-switching to enhanced tab!")
                            else:
                                print("\n🔄 Auto-switch conditions not met: { isComplete: true, hasEnhancedImage: false }")
                            
                            break
                            
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON decode error: {e}")
                        continue
            
            print("\n" + "=" * 50)
            print("📋 SUMMARY:")
            print(f"✅ Completion signal sent: {completion_found}")
            print(f"✅ Enhanced image included: {enhanced_image_found}")
            
            if completion_found and enhanced_image_found:
                print("\n🎉 SUCCESS! The completion signal is working correctly.")
                print("\nIf you're not seeing these messages in your browser console:")
                print("1. Make sure Developer Tools are open (F12)")
                print("2. Go to the Console tab")
                print("3. Clear the console and try uploading a document")
                print("4. Look for the messages above")
                print("\nIf the messages appear but tabs don't switch:")
                print("1. Check if there are any JavaScript errors")
                print("2. Verify the DocumentPreview component is receiving props")
                print("3. Check if the auto-switch useEffect is running")
            else:
                print("\n❌ PROBLEM: Completion signal or enhanced image missing!")
                print("The backend needs to be fixed.")
                
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_completion_signal())