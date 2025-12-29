#!/usr/bin/env python3
"""Fix all fancy quotes and apostrophes in main.py"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Use hex codes for fancy quotes
LEFT_SINGLE = '\u2018'   # '
RIGHT_SINGLE = '\u2019'  # '
LEFT_DOUBLE = '\u201c'   # "
RIGHT_DOUBLE = '\u201d'  # "

# Count issues before
count_before = content.count(LEFT_SINGLE) + content.count(RIGHT_SINGLE) + content.count(LEFT_DOUBLE) + content.count(RIGHT_DOUBLE)
print(f"Before: {count_before} fancy quotes found")

# Replace all fancy quotes with regular ones
content = content.replace(LEFT_SINGLE, "'")
content = content.replace(RIGHT_SINGLE, "'")
content = content.replace(LEFT_DOUBLE, '"')
content = content.replace(RIGHT_DOUBLE, '"')

# Write back
with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all fancy quotes in main.py")
print("Testing syntax...")

# Test compilation
import py_compile
try:
    py_compile.compile('main.py', doraise=True)
    print("✅ Syntax check PASSED!")
except SyntaxError as e:
    print(f"❌ Syntax error at line {e.lineno}: {e.msg}")
    if e.text:
        print(f"   {e.text.strip()}")
