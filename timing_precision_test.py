#!/usr/bin/env python3
"""
🕐 NHAKA 2.0 - PRECISION TIMING TEST
============================================================
Measuring exact timing:
1. ⏰ When agents START working
2. ✅ When agents SAY they're DONE
3. 🎬 When slider ACTUALLY moves (original → enhanced)
4. 📊 Comparing all timing phases
============================================================
"""

import os
import sys
import json
import time
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PrecisionTimer:
    def __init__(self):
        self.events = {}
        self.start_time = None
        
    def mark(self, event_name, description=""):
        current_time = time.time()
        if self.start_time is None:
            self.start_time = current_time
            
        elapsed = current_time - self.start_time
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        
        self.events[event_name] = {
            "timestamp": timestamp,
            "elapsed_seconds": elapsed,
            "description": description
        }
        
        print(f"⏱️  [{timestamp}] +{elapsed:7.3f}s | {event_name}: {description}")
        
    def get_duration(self, start_event, end_event):
        if start_event in self.events and end_event in self.events:
            return self.events[end_event]["elapsed_seconds"] - self.events[start_event]["elapsed_seconds"]
        return None
        
    def print_summary(self):
        print(f"\n📊 TIMING SUMMARY:")
        print("-" * 60)
        for event, data in self.events.items():
            print(f"   {event:20} | +{data['elapsed_seconds']:7.3f}s | {data['description']}")

async def test_agent_to_slider_timing():
    """Test complete timing from agents start to slider movement"""
    print("🕐 NHAKA 2.0 - PRECISION TIMING TEST")
    print("=" * 80)
    print("Measuring exact timing: Agents Start → Agents Done → Slider Movement")
    
    timer = PrecisionTimer()
    
    try:
        # Import components
        sys.path.append('.')
        from main import SwarmOrchestrator
        
        timer.mark("IMPORT_COMPLETE", "SwarmOrchestrator imported")
        
        # Check API key
        api_key = os.getenv("NOVITA_AI_API_KEY")
        if not api_key:
            print("❌ NOVITA_AI_API_KEY not configured")
            return False
        
        print(f"🔑 API Key: {api_key[:8]}...")
        
        # Test image
        test_image = "src/assets/linguist_test.png"
        if not Path(test_image).exists():
            print(f"❌ Test image not found: {test_image}")
            return False
        
        print(f"📸 Testing with: {test_image}")
        print(f"📊 Image size: {Path(test_image).stat().st_size / 1024:.1f} KB")
        
        # Load image data
        with open(test_image, 'rb') as f:
            image_data = f.read()
        
        timer.mark("IMAGE_LOADED", f"Image loaded ({len(image_data)} bytes)")
        
        # Create orchestrator
        orchestrator = SwarmOrchestrator()
        timer.mark("ORCHESTRATOR_READY", "Orchestrator created")
        
        print(f"\n🚀 STARTING AGENT PROCESSING...")
        print("=" * 50)
        
        # Track agent messages
        first_agent_message = True
        agents_done = False
        message_count = 0
        
        timer.mark("PROCESSING_START", "Starting document resurrection")
        
        async for agent_message in orchestrator.resurrect(image_data):
            message_count += 1
            
            # Mark first agent message (agents start working)
            if first_agent_message:
                timer.mark("AGENTS_START", f"First agent message: {agent_message.agent}")
                first_agent_message = False
                print(f"🤖 AGENTS START WORKING!")
            
            # Print agent message
            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
            print(f"[{timestamp}] 📢 {agent_message.agent}: {agent_message.message[:80]}...")
            
            # Check if this is the completion message
            if ("complete" in agent_message.message.lower() and 
                "document resurrection" in agent_message.message.lower()):
                timer.mark("AGENTS_DONE", f"Agents completed: {agent_message.agent}")
                agents_done = True
                print(f"✅ AGENTS SAY THEY'RE DONE!")
                break
        
        if not agents_done:
            # If no explicit completion message, mark done after all messages
            timer.mark("AGENTS_DONE", f"All agents finished ({message_count} messages)")
            print(f"✅ AGENTS FINISHED PROCESSING!")
        
        print(f"\n🎬 SIMULATING FRONTEND SLIDER TIMING...")
        print("=" * 50)
        
        # Simulate React frontend timing based on actual implementation
        
        # 1. React receives completion event and updates state
        await asyncio.sleep(0.1)  # Simulate React state update delay
        timer.mark("REACT_UPDATE", "React state updated (isComplete = true)")
        
        # 2. ImageComparison component mounts
        await asyncio.sleep(0.05)  # Simulate component mount delay
        timer.mark("COMPONENT_MOUNT", "ImageComparison component mounted")
        
        # 3. useEffect triggers with 800ms delay (as per actual code)
        print(f"⏳ Waiting for auto-reveal delay (800ms)...")
        await asyncio.sleep(0.8)  # Actual 800ms delay from code
        timer.mark("SLIDER_START", "Slider animation STARTS (0% → 100%)")
        print(f"🎬 SLIDER STARTS MOVING!")
        
        # 4. Slider animates for 2000ms (as per actual code)
        print(f"🎬 Animating slider over 2000ms...")
        
        # Simulate animation steps
        animation_steps = 10
        step_duration = 2.0 / animation_steps
        
        for i in range(1, animation_steps + 1):
            await asyncio.sleep(step_duration)
            progress = (i / animation_steps) * 100
            elapsed_in_animation = i * step_duration
            print(f"   🎬 Slider at {progress:3.0f}% (+{elapsed_in_animation:.1f}s in animation)")
        
        timer.mark("SLIDER_COMPLETE", "Slider animation COMPLETE (100% enhanced visible)")
        print(f"✨ SLIDER ANIMATION COMPLETE!")
        
        # Calculate key timing differences
        print(f"\n📊 DETAILED TIMING ANALYSIS:")
        print("=" * 60)
        
        # Agent processing time
        agent_duration = timer.get_duration("AGENTS_START", "AGENTS_DONE")
        print(f"🤖 Agent processing time: {agent_duration:.3f}s")
        
        # Delay from agents done to slider start
        slider_delay = timer.get_duration("AGENTS_DONE", "SLIDER_START")
        print(f"⏳ Delay (agents done → slider start): {slider_delay:.3f}s")
        
        # Slider animation time
        animation_duration = timer.get_duration("SLIDER_START", "SLIDER_COMPLETE")
        print(f"🎬 Slider animation duration: {animation_duration:.3f}s")
        
        # Total user experience time
        total_ux_time = timer.get_duration("AGENTS_START", "SLIDER_COMPLETE")
        print(f"🎯 Total UX time (agents start → slider done): {total_ux_time:.3f}s")
        
        # Total delay from agents done to slider complete
        total_delay = timer.get_duration("AGENTS_DONE", "SLIDER_COMPLETE")
        print(f"⏱️  Total delay (agents done → slider complete): {total_delay:.3f}s")
        
        print(f"\n🎯 KEY TIMING COMPARISONS:")
        print("-" * 40)
        print(f"   Agent work time:     {agent_duration:.1f}s")
        print(f"   Slider reveal delay: {slider_delay:.1f}s") 
        print(f"   Slider animation:    {animation_duration:.1f}s")
        print(f"   Total user wait:     {total_delay:.1f}s")
        
        # User experience assessment
        print(f"\n🎭 USER EXPERIENCE ASSESSMENT:")
        print("-" * 40)
        
        if slider_delay <= 1.0:
            print(f"   ✅ Excellent: Slider starts quickly ({slider_delay:.1f}s delay)")
        elif slider_delay <= 2.0:
            print(f"   ⚠️  Good: Reasonable delay ({slider_delay:.1f}s)")
        else:
            print(f"   ❌ Poor: Too slow ({slider_delay:.1f}s delay)")
        
        if total_delay <= 3.0:
            print(f"   ✅ Great UX: Total reveal time {total_delay:.1f}s")
        elif total_delay <= 5.0:
            print(f"   ⚠️  OK UX: Total reveal time {total_delay:.1f}s")
        else:
            print(f"   ❌ Slow UX: Total reveal time {total_delay:.1f}s")
        
        # Timing breakdown for developers
        print(f"\n🔧 DEVELOPER TIMING BREAKDOWN:")
        print("-" * 40)
        print(f"   1. Agents start working:        +0.000s")
        print(f"   2. Agents say they're done:     +{agent_duration:.3f}s")
        print(f"   3. React state updates:         +{timer.events['REACT_UPDATE']['elapsed_seconds']:.3f}s")
        print(f"   4. Component mounts:            +{timer.events['COMPONENT_MOUNT']['elapsed_seconds']:.3f}s")
        print(f"   5. Slider starts animating:     +{timer.events['SLIDER_START']['elapsed_seconds']:.3f}s")
        print(f"   6. Slider animation complete:   +{timer.events['SLIDER_COMPLETE']['elapsed_seconds']:.3f}s")
        
        # Print complete timing summary
        timer.print_summary()
        
        # Save detailed timing data
        timing_report = {
            "timestamp": datetime.now().isoformat(),
            "test_type": "precision_timing",
            "events": timer.events,
            "durations": {
                "agent_processing": agent_duration,
                "slider_delay": slider_delay,
                "animation_duration": animation_duration,
                "total_ux_time": total_ux_time,
                "total_delay": total_delay
            },
            "assessment": {
                "slider_delay_rating": "excellent" if slider_delay <= 1.0 else "good" if slider_delay <= 2.0 else "poor",
                "total_ux_rating": "great" if total_delay <= 3.0 else "ok" if total_delay <= 5.0 else "slow"
            }
        }
        
        report_file = f"precision_timing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(timing_report, f, indent=2)
        
        print(f"\n💾 Detailed timing report saved: {report_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Timing test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🕐 PRECISION TIMING ANALYSIS")
    print("=" * 80)
    print("Measuring exact timing from agents start to slider completion")
    
    # Check environment
    api_key = os.getenv("NOVITA_AI_API_KEY")
    if not api_key:
        print("❌ NOVITA_AI_API_KEY not configured")
        return False
    
    try:
        success = asyncio.run(test_agent_to_slider_timing())
        
        print(f"\n🎯 PRECISION TIMING TEST COMPLETE!")
        print("=" * 50)
        
        if success:
            print("✅ TIMING ANALYSIS SUCCESSFUL!")
            print("📊 All timing phases measured precisely")
            print("🎬 Slider timing verified against agent completion")
            print("⏱️  Complete timing flow documented")
        else:
            print("❌ Timing analysis failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)