#!/usr/bin/env python3
"""
Script to run all tests for the Nhaka 2.0 Archive Resurrection system.
"""
import subprocess
import sys


def run_command(command, description):
    """Run a command and report results."""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}\n")
    
    result = subprocess.run(command, shell=True)
    
    if result.returncode != 0:
        print(f"\n❌ {description} failed!")
        return False
    else:
        print(f"\n✅ {description} passed!")
        return True


def main():
    """Run all test suites."""
    print("🧪 Nhaka 2.0 Test Suite Runner")
    print("="*60)
    
    results = []
    
    # Run Python tests
    results.append(run_command(
        "pytest tests/ -v -m unit",
        "Python Unit Tests"
    ))
    
    # Run TypeScript tests
    results.append(run_command(
        "npm test",
        "TypeScript Tests"
    ))
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if all(results):
        print("\n✅ All test suites passed!")
        return 0
    else:
        print("\n❌ Some test suites failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
