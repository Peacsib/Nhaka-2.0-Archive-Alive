#!/usr/bin/env python3
"""
🐛 NHAKA 2.0 - DEBUG COMPLETION ISSUE
============================================================
Investigating why agents say "done" but frontend keeps spinning:
1. 🔍 Check if completion message is being sent
2. 📡 Verify streaming format
3. 🎬 Test frontend completion detection
4. 🔧 Fix the disconnect
============================================================
"""

import os
import sys
import json
import time
import requests
from datetime import datetime
from pathlib import Path

def debug_completion_flow():
    """Debug the completion flow issue"""
    print("🐛 DEBUGGING COMPLETION ISSUE")
    print("=" * 80)
    print("Testing why agents say 'done' but frontend keeps spinning...")
    
    backend_url = "https://nhaka-2-0-archive-alive.onrender.com"
    test_image = "src/assets/Salisbury to China.webp"  # Shanghai postcard
    
    if not Path(test_image).exists():
        print(f"❌ Test image not found: {test_image}")
        return False
    
    print(f"📸 Testing with Shanghai postcard: {test_image}")
    
    try:
        start_time = time.time()
        
        with open(test_image, 'rb') as f:
            files = {'file': (Path(test_image).name, f, 'image/webp')}
            
            print(f"🚀 Starting processing at {datetime.now().strftime('%H:%M:%S')}")
            
            response = requests.post(
                f"{backend_url}/resurrect/stream",
                files=files,
                stream=True,
                timeout=120
            )
            
            if response.status_code != 200:
                print(f"❌ Request failed: {response.status_code} - {response.text}")
                return False
            
            print(f"✅ Streaming started")
            print(f"\n📡 DETAILED MESSAGE ANALYSIS:")
            print("-" * 60)
            
            messages = []
            completion_found = False
            last_agent_message = None
            
            for line_num, line in enumerate(response.iter_lines(decode_unicode=True), 1):
                if line and line.startswith('data: '):
                    try:
                        data = json.loads(line[6:])
                        elapsed = time.time() - start_time
                        
                        print(f"[{line_num:3d}] +{elapsed:6.1f}s | {json.dumps(data, indent=2)}")
                        
                        if data.get('type') == 'complete':
                            completion_found = True
                            result = data.get('result', {})
                            
                            print(f"\n🎯 COMPLETION MESSAGE FOUND!")
                            print(f"   Type: {data.get('type')}")
                            print(f"   Confidence: {result.get('overall_confidence', 'N/A')}")
                            print(f"   Enhanced image: {'✅' if result.get('enhanced_image_base64') else '❌'}")
                            print(f"   Processing time: {result.get('processing_time_ms', 'N/A')}ms")
                            break
                        else:
                            # Regular agent message
                            agent = data.get('agent', 'Unknown')
                            message = data.get('message', '')
                            
                            messages.append(data)
                            last_agent_message = data
                            
                            # Check for completion indicators in message
                            if any(keyword in message.lower() for keyword in [
                                'complete', 'done', 'finished', 'ready'
                            ]):
                                print(f"   🔍 COMPLETION KEYWORD DETECTED: {message[:100]}...")
                            
                    except json.JSONDecodeError as e:
                        print(f"[{line_num:3d}] ❌ JSON Error: {line}")
                        continue
            
            total_time = time.time() - start_time
            
            print(f"\n📊 ANALYSIS RESULTS:")
            print("-" * 40)
            print(f"⏱️  Total processing time: {total_time:.1f}s")
            print(f"💬 Total messages: {len(messages)}")
            print(f"🎯 Completion message found: {'✅' if completion_found else '❌'}")
            
            if not completion_found:
                print(f"\n🚨 PROBLEM IDENTIFIED:")
                print(f"   ❌ No 'type: complete' message was sent!")
                print(f"   ❌ Frontend will keep spinning forever!")
                
                if last_agent_message:
                    print(f"\n📝 Last agent message:")
                    print(f"   Agent: {last_agent_message.get('agent')}")
                    print(f"   Message: {last_agent_message.get('message', '')[:200]}...")
                
                print(f"\n🔧 LIKELY CAUSES:")
                print(f"   1. Backend not sending completion message")
                print(f"   2. Streaming connection terminated early")
                print(f"   3. Error in result compilation")
                
                return False
            else:
                print(f"✅ Completion flow working correctly!")
                return True
                
    except Exception as e:
        print(f"❌ Debug test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_backend_completion_logic():
    """Check if there's an issue in the backend completion logic"""
    print(f"\n🔍 CHECKING BACKEND COMPLETION LOGIC:")
    print("-" * 50)
    
    # Check the main.py file for completion logic
    try:
        with open("main.py", 'r') as f:
            content = f.read()
        
        # Look for completion-related code
        completion_patterns = [
            'type.*complete',
            'StreamCompleteData',
            'yield.*complete',
            'processing_time_ms',
            'overall_confidence'
        ]
        
        print("🔍 Searching for completion patterns in backend code:")
        
        for pattern in completion_patterns:
            import re
            matches = re.findall(f'.*{pattern}.*', content, re.IGNORECASE)
            if matches:
                print(f"✅ Found '{pattern}': {len(matches)} occurrences")
                # Show first match as example
                if matches:
                    print(f"   Example: {matches[0].strip()[:100]}...")
            else:
                print(f"❌ Missing '{pattern}'")
        
        # Check for potential issues
        issues = []
        
        if 'yield' not in content:
            issues.append("No 'yield' statements found - streaming may not work")
        
        if 'type.*complete' not in content.lower():
            issues.append("No completion type message found")
        
        if issues:
            print(f"\n🚨 POTENTIAL ISSUES:")
            for issue in issues:
                print(f"   ❌ {issue}")
        else:
            print(f"\n✅ Backend completion logic looks correct")
        
        return len(issues) == 0
        
    except Exception as e:
        print(f"❌ Failed to check backend code: {e}")
        return False

def main():
    print("🐛 NHAKA 2.0 - COMPLETION ISSUE DEBUGGER")
    print("=" * 80)
    print("Investigating the 'agents done but frontend spinning' issue...")
    
    # Test 1: Debug the actual completion flow
    print("\n" + "="*60)
    print("TEST 1: Live Completion Flow Analysis")
    print("="*60)
    completion_works = debug_completion_flow()
    
    # Test 2: Check backend logic
    print("\n" + "="*60)
    print("TEST 2: Backend Completion Logic Check")
    print("="*60)
    backend_ok = check_backend_completion_logic()
    
    # Summary
    print(f"\n{'='*60}")
    print("🎯 DEBUGGING SUMMARY")
    print("="*60)
    
    if completion_works and backend_ok:
        print("✅ No issues found - system should be working")
        print("💡 The issue might be intermittent or browser-specific")
    elif not completion_works:
        print("🚨 CRITICAL ISSUE: Completion message not being sent!")
        print("🔧 SOLUTION: Fix backend to send proper completion message")
    elif not backend_ok:
        print("🚨 BACKEND ISSUE: Completion logic problems detected")
        print("🔧 SOLUTION: Fix backend completion code")
    
    print(f"\n📋 NEXT STEPS:")
    if not completion_works:
        print("1. Fix backend to send 'type: complete' message")
        print("2. Ensure all required fields are included")
        print("3. Test streaming endpoint thoroughly")
    else:
        print("1. Test with different browsers")
        print("2. Check network connectivity")
        print("3. Verify frontend completion detection")
    
    return completion_works and backend_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)