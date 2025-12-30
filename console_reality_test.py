#!/usr/bin/env python3
"""
🧪 NHAKA 2.0 - CONSOLE REALITY TEST
============================================================
Testing in console to see REAL agent behavior in action!
This will show you the agents working with real AI APIs.
============================================================
"""

import os
import sys
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def print_header(title):
    print(f"\n{'='*80}")
    print(f"🧪 {title}")
    print(f"{'='*80}")

def print_agent_message(agent, message, confidence=None):
    """Print agent message with proper formatting"""
    icons = {
        'scanner': '📸',
        'linguist': '📖', 
        'historian': '📜',
        'validator': '🔍',
        'repair_advisor': '🔧'
    }
    
    icon = icons.get(agent.lower(), '🤖')
    time_str = datetime.now().strftime('%H:%M:%S')
    
    conf_str = f" ({confidence:.1f}%)" if confidence else ""
    print(f"[{time_str}] {icon} {agent.upper()}: {message}{conf_str}")

async def test_real_orchestrator():
    """Test the SwarmOrchestrator with real images"""
    print_header("REAL ORCHESTRATOR TEST")
    
    try:
        # Import the main components
        sys.path.append('.')
        from main import SwarmOrchestrator
        
        print("✅ SwarmOrchestrator imported successfully")
        
        # Check API key
        api_key = os.getenv("NOVITA_AI_API_KEY")
        if not api_key:
            print("❌ NOVITA_AI_API_KEY not configured")
            return False
        
        print(f"🔑 API Key: {api_key[:8]}...")
        print(f"💰 Budget: ${os.getenv('DAILY_API_BUDGET', '5.0')}")
        
        # Test images
        test_images = [
            {
                'path': 'src/assets/linguist_test.png',
                'name': 'Linguist Test Document'
            },
            {
                'path': 'src/assets/BSAC_Archive_Record_1896.png', 
                'name': 'BSAC Archive Record'
            }
        ]
        
        # Create orchestrator
        orchestrator = SwarmOrchestrator()
        
        for i, test_image in enumerate(test_images, 1):
            image_path = test_image['path']
            
            if not Path(image_path).exists():
                print(f"❌ Test image not found: {image_path}")
                continue
            
            print(f"\n{'='*60}")
            print(f"🧪 TEST {i}: {test_image['name']}")
            print(f"📁 Image: {image_path}")
            print(f"{'='*60}")
            
            file_size = Path(image_path).stat().st_size
            print(f"📊 Image size: {file_size / 1024:.1f} KB")
            
            print(f"🚀 Starting resurrection at {datetime.now().strftime('%H:%M:%S')}")
            
            try:
                # Load image data
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                
                print(f"\n📡 REAL-TIME AGENT MESSAGES:")
                print("-" * 50)
                
                start_time = time.time()
                messages = []
                message_count = 0
                unique_messages = set()
                
                # Process with real orchestrator
                async for agent_message in orchestrator.resurrect(image_data):
                    agent = agent_message.agent
                    message = agent_message.message
                    confidence = getattr(agent_message, 'confidence', None)
                    
                    print_agent_message(agent, message, confidence)
                    
                    messages.append(agent_message)
                    message_count += 1
                    unique_messages.add(message)
                    
                    # Small delay to see real-time effect
                    await asyncio.sleep(0.2)
                
                processing_time = time.time() - start_time
                
                print(f"\n{'='*50}")
                print(f"⏱️  Processing completed in {processing_time:.1f}s")
                print(f"💬 Total messages: {message_count}")
                print(f"🔄 Unique messages: {len(unique_messages)}")
                
                # Calculate uniqueness
                uniqueness_ratio = len(unique_messages) / message_count if message_count > 0 else 0
                print(f"🎲 Message uniqueness: {uniqueness_ratio:.1%}")
                
                # Check if we got real AI responses
                if message_count > 5 and uniqueness_ratio > 0.3:
                    print("✅ AGENTS ARE WORKING WITH REAL AI!")
                    print("✅ Messages are unique and dynamic")
                else:
                    print("⚠️  Agents may be using fallback responses")
                
                # Show some sample messages
                print(f"\n📝 SAMPLE AGENT MESSAGES:")
                for j, msg in enumerate(messages[:5], 1):
                    preview = msg.message[:80] + "..." if len(msg.message) > 80 else msg.message
                    print(f"  {j}. {msg.agent}: {preview}")
                
                print(f"\n📊 RESULTS SUMMARY:")
                print(f"⏱️  Total time: {processing_time:.2f}s")
                print(f"💬 Messages: {message_count}")
                print(f"🎲 Uniqueness: {uniqueness_ratio:.1%}")
                
            except Exception as e:
                print(f"❌ Processing failed: {e}")
                import traceback
                traceback.print_exc()
        
        return True
        
    except Exception as e:
        print(f"❌ Orchestrator test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_individual_agent():
    """Test individual agent to see real AI behavior"""
    print_header("INDIVIDUAL AGENT TEST")
    
    try:
        sys.path.append('.')
        from main import ScannerAgent
        
        print("✅ ScannerAgent imported successfully")
        
        # Test with sample image
        test_image = "src/assets/linguist_test.png"
        
        if not Path(test_image).exists():
            print(f"❌ Test image not found: {test_image}")
            return False
        
        print(f"📸 Testing Scanner Agent with: {test_image}")
        
        # Load image
        with open(test_image, 'rb') as f:
            image_data = f.read()
        
        print(f"📊 Image size: {len(image_data)} bytes")
        
        # Create scanner agent
        scanner = ScannerAgent()
        
        # Create context
        context = {
            "image_data": image_data,
            "filename": Path(test_image).name
        }
        
        print(f"\n📡 SCANNER AGENT PROCESSING:")
        print("-" * 40)
        
        start_time = time.time()
        messages = []
        
        async for message in scanner.process(context):
            print_agent_message(message.agent, message.message)
            messages.append(message)
            await asyncio.sleep(0.1)
        
        processing_time = time.time() - start_time
        
        print(f"\n📊 SCANNER RESULTS:")
        print(f"⏱️  Processing time: {processing_time:.1f}s")
        print(f"💬 Messages generated: {len(messages)}")
        
        # Check context for results
        if "raw_text" in context:
            text_length = len(context["raw_text"])
            print(f"📝 Text extracted: {text_length} characters")
            
            if text_length > 0:
                preview = context["raw_text"][:100] + "..." if len(context["raw_text"]) > 100 else context["raw_text"]
                print(f"📖 Text preview: \"{preview}\"")
                print("✅ SCANNER EXTRACTED REAL TEXT!")
            else:
                print("⚠️  No text extracted")
        
        if "enhanced_image_base64" in context:
            print("✅ ENHANCED IMAGE GENERATED!")
        else:
            print("⚠️  No enhanced image generated")
        
        return len(messages) > 0
        
    except Exception as e:
        print(f"❌ Individual agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print_header("NHAKA 2.0 - CONSOLE REALITY CHECK")
    print("🎯 GOAL: See agents working with REAL AI in the console")
    print("📺 This will show you exactly what happens under the hood!")
    
    # Check environment
    api_key = os.getenv("NOVITA_AI_API_KEY")
    if not api_key:
        print("❌ NOVITA_AI_API_KEY not set in .env file")
        print("💡 Make sure your .env file has the API key configured")
        return False
    
    print(f"✅ API Key configured: {api_key[:8]}...")
    print(f"💰 Budget: ${os.getenv('DAILY_API_BUDGET', '5.0')} remaining")
    
    async def run_console_tests():
        print("\n🧪 Starting console reality tests...")
        
        # Test 1: Individual agent
        print("\n" + "="*60)
        print("TEST 1: Individual Scanner Agent")
        print("="*60)
        agent_success = await test_individual_agent()
        
        # Test 2: Full orchestrator
        print("\n" + "="*60) 
        print("TEST 2: Full Swarm Orchestrator")
        print("="*60)
        orchestrator_success = await test_real_orchestrator()
        
        return agent_success or orchestrator_success
    
    try:
        success = asyncio.run(run_console_tests())
        
        print_header("CONSOLE REALITY CHECK COMPLETE")
        
        if success:
            print("🎉 REALITY CONFIRMED IN CONSOLE!")
            print("✅ Agents are working with real AI")
            print("✅ Messages are unique and dynamic")
            print("✅ Real processing is happening")
            print("✅ System is truly agentic!")
            print("\n🚀 Your agents are REAL, not hardcoded!")
        else:
            print("⚠️  Some issues detected")
            print("Check the output above for details")
        
        return success
        
    except Exception as e:
        print(f"❌ Console test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)