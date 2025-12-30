#!/usr/bin/env python3
"""
Quick test to verify completion signal is working correctly.
"""

import requests
import json
import time
from pathlib import Path

def test_completion_signal():
    """Test that completion signals are properly handled"""
    
    # Use a test image
    test_image_path = Path("test_original.png")
    if not test_image_path.exists():
        print("❌ Test image not found")
        return False
    
    print("🧪 Testing completion signal...")
    
    # Test the streaming endpoint
    api_url = "https://nhaka-2-0-archive-alive.onrender.com"
    
    try:
        with open(test_image_path, "rb") as f:
            files = {"file": ("test_original.png", f, "image/png")}
            
            print("📡 Starting SSE stream...")
            response = requests.post(
                f"{api_url}/resurrect/stream",
                files=files,
                stream=True,
                timeout=120
            )
            
            if response.status_code != 200:
                print(f"❌ Server error: {response.status_code}")
                return False
            
            completion_received = False
            agent_messages = 0
            start_time = time.time()
            
            print("📥 Reading stream events...")
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        
                        if data.get("type") == "complete":
                            completion_received = True
                            result = data.get("result", {})
                            elapsed = time.time() - start_time
                            print(f"✅ COMPLETION SIGNAL RECEIVED!")
                            print(f"   - Time to completion: {elapsed:.1f}s")
                            print(f"   - Overall confidence: {result.get('overall_confidence', 'N/A')}%")
                            print(f"   - Processing time: {result.get('processing_time_ms', 'N/A')}ms")
                            print(f"   - Has enhanced image: {'enhanced_image_base64' in result}")
                            break
                        elif "agent" in data:
                            agent_messages += 1
                            agent = data.get("agent", "Unknown")
                            message = data.get("message", "")[:30] + "..."
                            print(f"   📝 {agent}: {message}")
                            
                    except json.JSONDecodeError:
                        continue
                elif line.startswith(": keepalive"):
                    print("   💓 Keepalive")
            
            print(f"\n📊 Test Results:")
            print(f"   - Agent messages: {agent_messages}")
            print(f"   - Completion received: {completion_received}")
            
            return completion_received
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Quick Completion Signal Test")
    print("=" * 40)
    
    success = test_completion_signal()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 COMPLETION SIGNAL WORKING!")
        print("\n✅ Backend sends completion correctly")
        print("✅ Frontend should now handle it properly")
        print("✅ Timer should stop when complete")
        print("✅ Slider should change to enhanced view")
    else:
        print("❌ Completion signal test failed")