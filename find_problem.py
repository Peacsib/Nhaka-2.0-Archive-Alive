#!/usr/bin/env python3
"""Find the unclosed triple-quoted string"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re
positions = [m.start() for m in re.finditer('"""', content)]
lines = []
for pos in positions:
    line_num = content[:pos].count('\n') + 1
    lines.append(line_num)

print(f'Total: {len(lines)} triple quotes (should be even: {len(lines) % 2 == 0})')

# Show all with open/close status
print('\nAll triple quotes:')
for i, line in enumerate(lines):
    status = "OPEN" if i % 2 == 0 else "CLOSE"
    print(f'  {i+1}. Line {line}: {status}')
