#!/usr/bin/env python3
"""Debug triple quotes around line 2200"""

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check lines 2200-2230
print("Checking lines 2200-2230 for triple quotes:")
for i in range(2199, 2230):
    if i < len(lines):
        line = lines[i]
        if '"""' in line:
            count = line.count('"""')
            print(f"Line {i+1}: {count} triple quote(s) - {line.strip()[:60]}")
