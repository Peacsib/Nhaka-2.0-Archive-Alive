#!/usr/bin/env python3
"""Fix ALL apostrophe issues in main.py"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace possessives
possessives = [
    ("team's", "team"),
    ("Team's", "Team"),
    ("agent's", "agent"),
    ("Agent's", "Agent"),
    ("Scanner's", "Scanner"),
    ("Linguist's", "Linguist"),
    ("Historian's", "Historian"),
    ("Validator's", "Validator"),
    ("document's", "document"),
    ("Document's", "Document"),
    ("user's", "user"),
    ("User's", "User"),
    ("model's", "model"),
    ("Model's", "Model"),
    ("system's", "system"),
    ("System's", "System"),
    ("other's", "other"),
    ("Other's", "Other"),
    ("agents'", "agents"),
    ("Agents'", "Agents"),
]

for old, new in possessives:
    content = content.replace(old, new)

# Replace contractions
contractions = [
    ("wasn't", "was not"),
    ("weren't", "were not"),
    ("isn't", "is not"),
    ("aren't", "are not"),
    ("don't", "do not"),
    ("doesn't", "does not"),
    ("didn't", "did not"),
    ("won't", "will not"),
    ("wouldn't", "would not"),
    ("shouldn't", "should not"),
    ("couldn't", "could not"),
    ("can't", "cannot"),
    ("haven't", "have not"),
    ("hasn't", "has not"),
    ("hadn't", "had not"),
    ("you're", "you are"),
    ("we're", "we are"),
    ("they're", "they are"),
    ("I'm", "I am"),
    ("it's", "it is"),
    ("that's", "that is"),
    ("what's", "what is"),
    ("who's", "who is"),
    ("there's", "there is"),
    ("here's", "here is"),
    ("I'd", "I would"),
    ("you'd", "you would"),
    ("he'd", "he would"),
    ("she'd", "she would"),
    ("we'd", "we would"),
    ("they'd", "they would"),
    ("I'll", "I will"),
    ("you'll", "you will"),
    ("he'll", "he will"),
    ("she'll", "she will"),
    ("we'll", "we will"),
    ("they'll", "they will"),
    ("I've", "I have"),
    ("you've", "you have"),
    ("we've", "we have"),
    ("they've", "they have"),
]

for old, new in contractions:
    content = content.replace(old, new)
    # Also handle capitalized versions
    content = content.replace(old.capitalize(), new.capitalize())

# Write back
with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all apostrophes")

# Test
import py_compile
try:
    py_compile.compile('main.py', doraise=True)
    print("SUCCESS! Syntax is valid.")
except SyntaxError as e:
    print(f"Still has error at line {e.lineno}: {e.msg}")
    if e.text:
        print(f"  {e.text.strip()[:80]}")
