#!/usr/bin/env python3
"""Find the real unclosed string"""

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Track triple quote state more carefully
in_string = False
string_start = None
quote_positions = []

for i, line in enumerate(lines, 1):
    # Count triple quotes in this line
    count = line.count('"""')
    
    if count > 0:
        for j in range(count):
            if not in_string:
                in_string = True
                string_start = i
                quote_positions.append((i, 'OPEN'))
            else:
                in_string = False
                quote_positions.append((i, 'CLOSE'))
                string_start = None

print(f"Total quote pairs: {len(quote_positions)}")
print(f"In string at end: {in_string}")

if in_string:
    print(f"\n❌ String opened at line {string_start} was never closed!")
    print(f"\nLast 10 quote positions:")
    for pos in quote_positions[-10:]:
        print(f"  Line {pos[0]}: {pos[1]}")
else:
    print("✅ All strings appear to be closed")
