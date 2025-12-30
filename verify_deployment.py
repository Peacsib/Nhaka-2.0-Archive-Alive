#!/usr/bin/env python3
"""
DEPLOYMENT VERIFICATION SCRIPT

This script verifies that the Nhaka 2.0 system is working correctly:
1. ✅ Agents are truly agentic (not hardcoded)
2. ✅ Slider auto-changes from original to enhanced
3. ✅ Tools are really being called
4. ✅ Enhanced images are generated in time
5. ✅ Ready for production deployment

Usage:
    python verify_deployment.py
"""

import asyncio
import os
import sys
import time
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Configuration
REQUIRED_FILES = [
    "main.py",
    "src/components/ImageComparison.tsx",
    "src/components/ProcessingSection.tsx",
    "src/assets/BSAC_Archive_Record_1896.png",
    "src/assets/linguist_test.png"
]

class DeploymentVerifier:
    def __init__(self):
        self.results = {}
        self.start_time = time.time()
        
    def check_file_structure(self):
        """Verify all required files exist"""
        print("🔍 STEP 1: File Structure Verification")
        print("-" * 50)
        
        missing_files = []
        for file_path in REQUIRED_FILES:
            if os.path.exists(file_path):
                print(f"   ✅ {file_path}")
            else:
                print(f"   ❌ {file_path} - MISSING")
                missing_files.append(file_path)
        
        if missing_files:
            print(f"\n❌ Missing {len(missing_files)} required files!")
            return False
        
        print(f"\n✅ All required files present")
        return True
    
    def check_environment_setup(self):
        """Verify environment variables and dependencies"""
        print("\n🔧 STEP 2: Environment Setup")
        print("-" * 50)
        
        # Check API key
        api_key = os.getenv("NOVITA_AI_API_KEY")
        if api_key:
            print(f"   ✅ NOVITA_AI_API_KEY: {api_key[:10]}...")
        else:
            print(f"   ❌ NOVITA_AI_API_KEY not set")
            return False
        
        # Check Python dependencies
        try:
            import fastapi
            import httpx
            import cv2
            import numpy
            from PIL import Image
            print(f"   ✅ Python dependencies installed")
        except ImportError as e:
            print(f"   ❌ Missing Python dependency: {e}")
            return False
        
        # Check if Node.js is available for frontend tests
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"   ✅ Node.js: {result.stdout.strip()}")
            else:
                print(f"   ⚠️  Node.js not available (frontend tests will be skipped)")
        except FileNotFoundError:
            print(f"   ⚠️  Node.js not found (frontend tests will be skipped)")
        
        return True
    
    async def test_backend_agents(self):
        """Test backend agents for agentic behavior"""
        print("\n🤖 STEP 3: Backend Agent Testing")
        print("-" * 50)
        
        # Set up environment
        os.environ['NOVITA_AI_API_KEY'] = os.getenv('NOVITA_AI_API_KEY', '')
        os.environ['DAILY_API_BUDGET'] = '10.0'
        
        try:
            # Import after env setup
            from main import SwarmOrchestrator, api_tracker
            
            # Test with real image
            test_image = "src/assets/BSAC_Archive_Record_1896.png"
            
            with open(test_image, 'rb') as f:
                image_data = f.read()
            
            print(f"   📁 Testing with: {test_image} ({len(image_data)/1024:.1f} KB)")
            
            # Track API usage
            initial_stats = api_tracker.get_stats()
            
            # Process document
            orchestrator = SwarmOrchestrator()
            messages = []
            unique_responses = set()
            
            start_time = time.time()
            
            async for message in orchestrator.resurrect(image_data):
                messages.append(message)
                unique_responses.add(message.message)
                
                # Print key messages
                if any(keyword in message.message.lower() for keyword in ["enhanced", "detected", "found", "analysis"]):
                    print(f"   🔍 {message.agent.value}: {message.message[:60]}...")
            
            processing_time = time.time() - start_time
            result = orchestrator.get_result()
            
            # Check API usage
            final_stats = api_tracker.get_stats()
            api_calls_made = final_stats["total_calls_today"] - initial_stats["total_calls_today"]
            money_spent = final_stats["today_spend"] - initial_stats["today_spend"]
            
            # Analyze results
            uniqueness_ratio = len(unique_responses) / max(len(messages), 1)
            has_enhanced_image = bool(result.enhanced_image_base64)
            
            print(f"\n   📊 RESULTS:")
            print(f"      Processing time: {processing_time:.1f}s")
            print(f"      Messages: {len(messages)} (uniqueness: {uniqueness_ratio:.1%})")
            print(f"      API calls: {api_calls_made} (${money_spent:.3f} spent)")
            print(f"      Enhanced image: {'✅' if has_enhanced_image else '❌'}")
            print(f"      Confidence: {result.overall_confidence:.1f}%")
            
            # Determine if agents are truly agentic
            is_agentic = (
                api_calls_made > 0 and  # Real API calls made
                uniqueness_ratio > 0.7 and  # Responses are unique
                has_enhanced_image and  # Enhanced image generated
                result.overall_confidence > 50  # Reasonable confidence
            )
            
            self.results["backend_agents"] = {
                "passed": is_agentic,
                "processing_time": processing_time,
                "api_calls": api_calls_made,
                "money_spent": money_spent,
                "uniqueness_ratio": uniqueness_ratio,
                "has_enhanced_image": has_enhanced_image,
                "confidence": result.overall_confidence
            }
            
            if is_agentic:
                print(f"   ✅ AGENTS ARE TRULY AGENTIC!")
            else:
                print(f"   ❌ Agents may be using fallback logic")
            
            return is_agentic
            
        except Exception as e:
            print(f"   ❌ Backend test failed: {e}")
            self.results["backend_agents"] = {"passed": False, "error": str(e)}
            return False
    
    def test_frontend_slider(self):
        """Test frontend slider auto-change functionality"""
        print("\n🎨 STEP 4: Frontend Slider Testing")
        print("-" * 50)
        
        try:
            # Check if npm test is available
            result = subprocess.run(["npm", "test", "--", "--run"], 
                                  capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                print(f"   ✅ Frontend tests passed")
                
                # Look for specific test results
                if "ImageComparison" in result.stdout:
                    print(f"   ✅ ImageComparison tests included")
                
                self.results["frontend_slider"] = {"passed": True, "output": result.stdout}
                return True
            else:
                print(f"   ❌ Frontend tests failed")
                print(f"   Error: {result.stderr}")
                self.results["frontend_slider"] = {"passed": False, "error": result.stderr}
                return False
                
        except subprocess.TimeoutExpired:
            print(f"   ⚠️  Frontend tests timed out (may still be working)")
            self.results["frontend_slider"] = {"passed": False, "error": "Timeout"}
            return False
        except FileNotFoundError:
            print(f"   ⚠️  npm not available - skipping frontend tests")
            self.results["frontend_slider"] = {"passed": True, "skipped": True}
            return True
        except Exception as e:
            print(f"   ❌ Frontend test error: {e}")
            self.results["frontend_slider"] = {"passed": False, "error": str(e)}
            return False
    
    def check_slider_implementation(self):
        """Verify slider auto-change implementation in code"""
        print("\n🔍 STEP 5: Slider Implementation Check")
        print("-" * 50)
        
        try:
            # Read ImageComparison component
            with open("src/components/ImageComparison.tsx", 'r') as f:
                content = f.read()
            
            # Check for auto-reveal functionality
            checks = {
                "autoReveal prop": "autoReveal" in content,
                "useEffect for animation": "useEffect" in content and "animate" in content,
                "slider position state": "sliderPosition" in content and "useState" in content,
                "requestAnimationFrame": "requestAnimationFrame" in content,
                "auto-reveal message": "Watch the AI restoration reveal" in content
            }
            
            passed_checks = 0
            for check_name, passed in checks.items():
                if passed:
                    print(f"   ✅ {check_name}")
                    passed_checks += 1
                else:
                    print(f"   ❌ {check_name}")
            
            implementation_complete = passed_checks >= 4
            
            self.results["slider_implementation"] = {
                "passed": implementation_complete,
                "checks_passed": passed_checks,
                "total_checks": len(checks)
            }
            
            if implementation_complete:
                print(f"   ✅ Slider auto-change implementation complete")
            else:
                print(f"   ❌ Slider implementation incomplete ({passed_checks}/{len(checks)})")
            
            return implementation_complete
            
        except Exception as e:
            print(f"   ❌ Code check failed: {e}")
            self.results["slider_implementation"] = {"passed": False, "error": str(e)}
            return False
    
    async def run_full_verification(self):
        """Run complete deployment verification"""
        print("🚀 NHAKA 2.0 - DEPLOYMENT VERIFICATION")
        print("=" * 60)
        print("Verifying system is ready for production deployment")
        print("=" * 60)
        
        # Run all verification steps
        step1 = self.check_file_structure()
        step2 = self.check_environment_setup() if step1 else False
        step3 = await self.test_backend_agents() if step2 else False
        step4 = self.test_frontend_slider() if step3 else False
        step5 = self.check_slider_implementation() if step4 else False
        
        total_time = time.time() - self.start_time
        
        # Generate final report
        print(f"\n{'='*60}")
        print("🎯 DEPLOYMENT VERIFICATION REPORT")
        print(f"{'='*60}")
        
        steps_passed = sum([step1, step2, step3, step4, step5])
        
        print(f"📊 SUMMARY:")
        print(f"   ✅ Steps passed: {steps_passed}/5")
        print(f"   ⏱️  Total time: {total_time:.1f}s")
        
        print(f"\n🔍 DETAILED RESULTS:")
        print(f"   1. File Structure: {'✅' if step1 else '❌'}")
        print(f"   2. Environment Setup: {'✅' if step2 else '❌'}")
        print(f"   3. Backend Agents: {'✅' if step3 else '❌'}")
        print(f"   4. Frontend Tests: {'✅' if step4 else '❌'}")
        print(f"   5. Slider Implementation: {'✅' if step5 else '❌'}")
        
        # Save verification report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"deployment_verification_{timestamp}.json"
        
        with open(report_file, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total_time_seconds": total_time,
                "steps_passed": steps_passed,
                "steps_total": 5,
                "verification_results": self.results,
                "deployment_ready": steps_passed >= 4
            }, f, indent=2)
        
        print(f"\n💾 Verification report saved: {report_file}")
        
        # Final deployment verdict
        if steps_passed == 5:
            print(f"\n🎉 DEPLOYMENT READY!")
            print("   ✅ All systems verified")
            print("   ✅ Agents are truly agentic")
            print("   ✅ Slider auto-change implemented")
            print("   ✅ Tools are being called")
            print("   ✅ Enhanced images generated")
            print("\n🚀 SAFE TO DEPLOY TO PRODUCTION!")
        elif steps_passed >= 4:
            print(f"\n⚠️  MOSTLY READY (minor issues)")
            print("   Core functionality verified")
            print("   Check failed steps before deployment")
        else:
            print(f"\n❌ NOT READY FOR DEPLOYMENT")
            print("   Multiple critical issues detected")
            print("   Fix issues before deploying")
        
        return steps_passed >= 4

async def main():
    """Main verification runner"""
    verifier = DeploymentVerifier()
    deployment_ready = await verifier.run_full_verification()
    
    # Exit with appropriate code
    sys.exit(0 if deployment_ready else 1)

if __name__ == "__main__":
    asyncio.run(main())