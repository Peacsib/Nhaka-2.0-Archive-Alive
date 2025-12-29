#!/usr/bin/env python3
"""Fix fancy quotes in main.py"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace fancy quotes with regular quotes
content = content.replace(''', "'")
content = content.replace(''', "'")
content = content.replace('"', '"')
content = content.replace('"', '"')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all fancy quotes in main.py")
