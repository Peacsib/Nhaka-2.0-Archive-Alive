#!/usr/bin/env python3
"""Check the f-string line"""

with open('main.py', 'rb') as f:
    lines = f.readlines()

# Check line 2220 (index 2219) which should have user_input = f"""
line = lines[2219]
print(f"Line 2220 bytes: {line}")
print(f"Contains 'f' before triple quote: {b'f\"\"\"' in line}")

# Check if there's something wrong with the line
for i, byte in enumerate(line):
    if byte > 127:
        print(f"Non-ASCII byte at position {i}: {hex(byte)}")
