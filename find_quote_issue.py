#!/usr/bin/env python3
"""Find the exact quote issue"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Try to compile and get the exact error
import ast
try:
    ast.parse(content)
    print("SUCCESS! No syntax errors.")
except SyntaxError as e:
    print(f"Syntax error at line {e.lineno}, column {e.offset}")
    print(f"Message: {e.msg}")
    if e.text:
        print(f"Text: {e.text.strip()[:80]}")
    
    # Show context
    lines = content.split('\n')
    start = max(0, e.lineno - 5)
    end = min(len(lines), e.lineno + 3)
    print(f"\nContext (lines {start+1}-{end}):")
    for i in range(start, end):
        marker = ">>>" if i == e.lineno - 1 else "   "
        print(f"{marker} {i+1}: {lines[i][:70]}")
