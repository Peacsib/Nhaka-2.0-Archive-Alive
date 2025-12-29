#!/usr/bin/env python3
"""Find the unclosed triple-quoted string"""

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Track triple quote state
in_string = False
open_line = None

for i, line in enumerate(lines, 1):
    count = line.count('"""')
    
    if count > 0:
        # Toggle state for each triple quote
        for _ in range(count):
            if not in_string:
                in_string = True
                open_line = i
            else:
                in_string = False
                open_line = None

if in_string and open_line:
    print(f"❌ Unclosed triple-quoted string starting at line {open_line}")
    print(f"\nContext (lines {open_line}-{min(open_line+10, len(lines))}):")
    for i in range(open_line-1, min(open_line+10, len(lines))):
        print(f"  {i+1}: {lines[i].rstrip()}")
else:
    print("✅ All triple-quoted strings are properly closed")
