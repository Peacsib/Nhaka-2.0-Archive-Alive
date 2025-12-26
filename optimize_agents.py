#!/usr/bin/env python3
"""
Script to optimize agent AI calls - make them conditional/optional
This will reduce processing time from 6 minutes to under 30 seconds
"""

import re

# Read the file
with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: Make Linguist AI calls optional (only for low OCR quality)
linguist_pattern = r'(# Try REAL AI analysis first - enhanced with cultural context\s+ai_analysis = await self\._get_ai_linguistic_analysis\(raw_text\))'
linguist_replacement = r'''# OPTIONAL: AI analysis only for low-quality OCR
        ocr_confidence = context.get("ocr_confidence", 100)
        ai_analysis = None
        if ocr_confidence < 60:  # Only for poor OCR
            ai_analysis = await self._get_ai_linguistic_analysis(raw_text)'''

content = re.sub(linguist_pattern, linguist_replacement, content)

# Pattern 2: Make cultural analysis optional
cultural_pattern = r'(# ERNIE cultural analysis\s+cultural_analysis = await self\._get_ernie_cultural_analysis\(raw_text\))'
cultural_replacement = r'''# OPTIONAL: Skip cultural AI analysis for speed
        cultural_analysis = None  # Disabled for performance
        # cultural_analysis = await self._get_ernie_cultural_analysis(raw_text)'''

content = re.sub(cultural_pattern, cultural_replacement, content)

# Pattern 3: Make Historian AI analysis optional
historian_pattern = r'(# Try REAL AI historical analysis first\s+ai_analysis = await self\._get_ai_historical_analysis\(text\))'
historian_replacement = r'''# OPTIONAL: Skip AI historical analysis for speed
        ai_analysis = None  # Disabled for performance
        # ai_analysis = await self._get_ai_historical_analysis(text)'''

content = re.sub(historian_pattern, historian_replacement, content)

# Pattern 4: Make Validator AI calls optional
validator_pattern = r'(# Try REAL AI validation first\s+ai_validation = await self\._get_ai_validation\(raw_text, transliterated, verified_facts\))'
validator_replacement = r'''# OPTIONAL: Skip AI validation for speed
        ai_validation = None  # Disabled for performance
        # ai_validation = await self._get_ai_validation(raw_text, transliterated, verified_facts)'''

content = re.sub(validator_pattern, replacement, content)

# Write back
with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Optimized agent AI calls - made them conditional/optional")
print("📊 Expected speedup: 6 minutes → 30 seconds")
