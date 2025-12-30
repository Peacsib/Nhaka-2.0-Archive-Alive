#!/usr/bin/env python3
"""
Debug Certificate OCR - Test specifically with Colonial_Certificate_1957.jpg
This will help us understand why the OCR is producing incorrect text.
"""
import asyncio
import httpx
import json
import base64
from pathlib import Path

async def debug_certificate_ocr():
    """Debug OCR specifically with the Colonial Certificate"""
    
    print("🔍 CERTIFICATE OCR DEBUG TEST")
    print("=" * 50)
    
    # Load the actual certificate image
    cert_path = Path("src/assets/Colonial_Certificate_1957.jpg")
    if not cert_path.exists():
        print(f"❌ Certificate not found: {cert_path}")
        return
    
    print(f"📸 Loading certificate: {cert_path}")
    print(f"📊 File size: {cert_path.stat().st_size / 1024:.1f} KB")
    
    with open(cert_path, 'rb') as f:
        image_data = f.read()
    
    # Test with the live API
    api_url = "https://nhaka-2-0-archive-alive.onrender.com/resurrect/stream"
    
    print(f"📤 Sending certificate to API: {api_url}")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            files = {"file": ("Colonial_Certificate_1957.jpg", image_data, "image/jpeg")}
            response = await client.post(api_url, files=files)
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ API Error: {response.text}")
                return
            
            print("\n🔄 Processing OCR results...")
            print("=" * 50)
            
            scanner_messages = []
            raw_ocr_text = ""
            completion_result = None
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        event_type = data.get("type", "unknown")
                        
                        if event_type == "agent":
                            agent = data.get("agent", "")
                            message = data.get("message", "")
                            
                            if agent == "scanner":
                                scanner_messages.append(message)
                                print(f"📸 Scanner: {message}")
                        
                        elif event_type == "complete":
                            completion_result = data.get("result", {})
                            raw_ocr_text = completion_result.get("raw_ocr_text", "")
                            break
                            
                    except json.JSONDecodeError:
                        continue
            
            print("\n" + "=" * 50)
            print("📋 OCR ANALYSIS RESULTS:")
            print("=" * 50)
            
            if raw_ocr_text:
                print(f"📝 Raw OCR Text ({len(raw_ocr_text)} chars):")
                print("-" * 30)
                print(repr(raw_ocr_text))  # Use repr to show special characters
                print("-" * 30)
                print("Readable format:")
                print(raw_ocr_text)
                print("-" * 30)
                
                # Analyze the OCR quality
                lines = raw_ocr_text.split('\n')
                non_empty_lines = [line.strip() for line in lines if line.strip()]
                
                print(f"\n📊 OCR Quality Analysis:")
                print(f"  • Total characters: {len(raw_ocr_text)}")
                print(f"  • Total lines: {len(lines)}")
                print(f"  • Non-empty lines: {len(non_empty_lines)}")
                print(f"  • Average line length: {len(raw_ocr_text) / max(len(non_empty_lines), 1):.1f}")
                
                # Check for common OCR issues
                issues = []
                if len(raw_ocr_text) < 50:
                    issues.append("Very short text - possible OCR failure")
                if '[unclear]' in raw_ocr_text:
                    issues.append("Contains [unclear] markers")
                if len(non_empty_lines) < 3:
                    issues.append("Very few lines detected")
                
                # Check for garbage characters
                printable_ratio = sum(1 for c in raw_ocr_text if c.isprintable()) / max(len(raw_ocr_text), 1)
                if printable_ratio < 0.8:
                    issues.append(f"Low printable character ratio: {printable_ratio:.1%}")
                
                if issues:
                    print(f"\n⚠️ Potential OCR Issues:")
                    for issue in issues:
                        print(f"  • {issue}")
                else:
                    print(f"\n✅ OCR quality looks reasonable")
                
            else:
                print("❌ No OCR text extracted!")
            
            # Check what the agents said
            print(f"\n🤖 Scanner Agent Messages:")
            for i, msg in enumerate(scanner_messages, 1):
                print(f"  {i}. {msg}")
            
            # Check if enhanced image was created
            if completion_result:
                enhanced_image = completion_result.get("enhanced_image_base64", "")
                if enhanced_image:
                    print(f"\n🖼️ Enhanced image created: {len(enhanced_image)} chars")
                    
                    # Save enhanced image for inspection
                    try:
                        import base64
                        from PIL import Image
                        import io
                        
                        img_data = base64.b64decode(enhanced_image)
                        img = Image.open(io.BytesIO(img_data))
                        enhanced_path = "certificate_enhanced_debug.png"
                        img.save(enhanced_path)
                        print(f"💾 Enhanced image saved: {enhanced_path}")
                        print(f"📏 Enhanced image size: {img.size}")
                    except Exception as e:
                        print(f"❌ Could not save enhanced image: {e}")
                else:
                    print(f"\n❌ No enhanced image created")
            
            print(f"\n" + "=" * 50)
            print("🎯 RECOMMENDATIONS:")
            
            if len(raw_ocr_text) < 50:
                print("1. 📸 The certificate image may have poor quality or contrast")
                print("2. 🔧 Try pre-processing the image (increase contrast, resize)")
                print("3. 🤖 Consider using a different OCR model for handwritten text")
                print("4. 👁️ Manual inspection: Check if text is actually readable by humans")
            elif '[unclear]' in raw_ocr_text:
                print("1. 📝 Some text is unclear - this is expected for old documents")
                print("2. 🎯 The Linguist and Historian agents should help clean this up")
            else:
                print("1. ✅ OCR extraction looks successful")
                print("2. 🔄 Check if the completion signal and UI updates are working")
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_certificate_ocr())