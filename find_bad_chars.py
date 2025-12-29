#!/usr/bin/env python3
"""Find problematic characters in main.py"""

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check lines around 1926
print("Checking lines 1920-1935 for problematic characters:")
for i in range(1920, 1935):
    if i < len(lines):
        line = lines[i]
        # Check for fancy apostrophes
        if '\u2019' in line or '\u2018' in line:
            print(f"Line {i+1}: Found fancy apostrophe")
            print(f"  {line.strip()[:80]}")
            # Show position
            for j, char in enumerate(line):
                if char in ['\u2019', '\u2018']:
                    print(f"  Position {j}: {repr(char)}")
