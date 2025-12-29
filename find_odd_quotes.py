#!/usr/bin/env python3
"""Find lines with odd number of quotes"""

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find lines with odd number of double quotes (excluding triple quotes)
for i, line in enumerate(lines, 1):
    # Remove triple quotes first
    temp = line.replace('"""', '')
    # Count remaining double quotes
    count = temp.count('"')
    if count % 2 != 0:
        # Check if it's a continuation line (inside a multi-line string)
        # These are OK
        if line.strip().startswith('-') or line.strip().startswith('#'):
            continue
        print(f"Line {i}: {count} quotes - {line.strip()[:60]}")
