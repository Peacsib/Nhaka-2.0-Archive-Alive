#!/usr/bin/env python3
with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check each line for triple quotes
for i, line in enumerate(lines, 1):
    count = line.count('"""')
    if count > 2:
        print(f'Line {i} has {count} triple quotes: {repr(line[:100])}')
    elif count == 1:
        # Single triple quote on a line - potential issue
        print(f'Line {i} has 1 triple quote (odd): {repr(line[:100])}')
