#!/usr/bin/env python3
"""
Test script for Nhaka 2.0 Multi-Agent Swarm
"""
import asyncio
import json
from main import SwarmOrchestrator

async def test_swarm():
    """Test the multi-agent swarm with demo data"""
    print("🚀 Testing Nhaka 2.0 Multi-Agent Swarm...")
    
    # Create demo image data (empty bytes for testing)
    demo_image = b"demo_image_data"
    
    orchestrator = SwarmOrchestrator()
    
    print("\n📋 Agent Messages:")
    print("-" * 60)
    
    async for message in orchestrator.resurrect(demo_image):
        agent_icon = {
            "scanner": "🔬",
            "linguist": "📚", 
            "historian": "📜",
            "validator": "🔍",
            "repair_advisor": "🔧"
        }.get(message.agent.value, "🤖")
        
        confidence_str = f" ({message.confidence:.0f}%)" if message.confidence else ""
        section_str = f" [{message.document_section}]" if message.document_section else ""
        
        print(f"{agent_icon} {message.agent.value.upper()}{confidence_str}{section_str}: {message.message}")
    
    print("-" * 60)
    
    # Get final result
    result = orchestrator.get_result()
    
    print(f"\n✅ RESURRECTION COMPLETE!")
    print(f"   Overall Confidence: {result.overall_confidence:.1f}%")
    print(f"   Processing Time: {result.processing_time_ms}ms")
    print(f"   Agent Messages: {len(result.agent_messages)}")
    print(f"   Text Segments: {len(result.segments)}")
    
    if result.repair_recommendations:
        print(f"   Repair Recommendations: {len(result.repair_recommendations)}")
        for rec in result.repair_recommendations[:2]:
            print(f"     - {rec.issue} ({rec.severity})")
    
    print(f"\n📝 Sample Resurrected Text:")
    if result.segments:
        sample_text = result.segments[0].text[:200]
        print(f"   {sample_text}{'...' if len(sample_text) == 200 else ''}")

if __name__ == "__main__":
    asyncio.run(test_swarm())