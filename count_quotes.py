#!/usr/bin/env python3
"""Count triple quotes in main.py"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Count triple quotes
count = content.count('"""')
print(f'Total triple quotes: {count}')
print(f'Should be even: {count % 2 == 0}')

if count % 2 != 0:
    print("\n❌ ODD number of triple quotes - there's an unclosed string!")
    
    # Find positions
    import re
    positions = [m.start() for m in re.finditer('"""', content)]
    lines_with_triple = []
    for pos in positions:
        line_num = content[:pos].count('\n') + 1
        lines_with_triple.append(line_num)
    
    print(f'\nTriple quotes at lines:')
    for i, line in enumerate(lines_with_triple):
        status = "OPEN" if i % 2 == 0 else "CLOSE"
        print(f'  Line {line}: {status}')
        if i >= 50:  # Show first 50
            print(f'  ... and {len(lines_with_triple) - 50} more')
            break
