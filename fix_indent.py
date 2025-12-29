#!/usr/bin/env python3
"""Fix indentation issues in f-strings"""

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 2223 - add proper indentation if missing
# The line should be part of an f-string, so it doesn't need Python indentation
# But it seems to have lost its leading content

# Check if line 2223 (index 2222) starts without proper context
if len(lines) > 2222:
    line = lines[2222]
    print(f"Line 2223 before: {repr(line)}")
    
    # If the line starts with 'OCR' without being part of a string, there's an issue
    if line.strip().startswith('OCR CONFIDENCE'):
        # This line should be inside an f-string, check if previous line has the opening
        prev_line = lines[2220] if len(lines) > 2220 else ""
        print(f"Line 2221: {repr(prev_line)}")
        
        # The f-string content doesn't need indentation, but the line before should have f"""
        # Let's check if the issue is that the f-string isn't being recognized

# Actually, let's just rewrite the problematic section
# Find and replace the entire user_input assignment

content = ''.join(lines)

old_section = '''        user_input = f"""Analyze this historical document:

OCR CONFIDENCE: {ocr_confidence:.1f}%
TEXT SAMPLE: {text[:800]}

Identify damage types and their approximate regions on the document."""'''

new_section = '''        user_input = f"""Analyze this historical document:
OCR CONFIDENCE: {ocr_confidence:.1f} percent
TEXT SAMPLE: {text[:800]}
Identify damage types and their approximate regions on the document."""'''

if old_section in content:
    content = content.replace(old_section, new_section)
    print("Fixed the user_input section")
else:
    print("Could not find the exact section to replace")
    # Try a different approach - fix line by line
    for i in range(2220, 2228):
        if i < len(lines):
            print(f"Line {i+1}: {repr(lines[i][:60])}")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

# Test
import py_compile
try:
    py_compile.compile('main.py', doraise=True)
    print("SUCCESS!")
except SyntaxError as e:
    print(f"Still error at line {e.lineno}: {e.msg}")
