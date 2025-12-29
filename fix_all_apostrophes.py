#!/usr/bin/env python3
"""Fix ALL apostrophes and contractions in main.py"""

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all contractions with expanded forms to avoid apostrophe issues
replacements = {
    "you're": "you are",
    "You're": "You are",
    "I'm": "I am",
    "I'm": "I am",  # Fancy apostrophe version
    "we're": "we are",
    "We're": "We are",
    "they're": "they are",
    "They're": "They are",
    "it's": "it is",
    "It's": "It is",
    "that's": "that is",
    "That's": "That is",
    "what's": "what is",
    "What's": "What is",
    "who's": "who is",
    "Who's": "Who is",
    "there's": "there is",
    "There's": "There is",
    "here's": "here is",
    "Here's": "Here is",
    "don't": "do not",
    "Don't": "Do not",
    "doesn't": "does not",
    "Doesn't": "Does not",
    "didn't": "did not",
    "Didn't": "Did not",
    "won't": "will not",
    "Won't": "Will not",
    "wouldn't": "would not",
    "Wouldn't": "Would not",
    "shouldn't": "should not",
    "Shouldn't": "Should not",
    "can't": "cannot",
    "Can't": "Cannot",
    "couldn't": "could not",
    "Couldn't": "Could not",
    "isn't": "is not",
    "Isn't": "Is not",
    "aren't": "are not",
    "Aren't": "Are not",
    "wasn't": "was not",
    "Wasn't": "Was not",
    "weren't": "were not",
    "Weren't": "Were not",
    "haven't": "have not",
    "Haven't": "Have not",
    "hasn't": "has not",
    "Hasn't": "Has not",
    "hadn't": "had not",
    "Hadn't": "Had not",
    "I'd": "I would",
    "I'd": "I would",  # Fancy apostrophe
    "you'd": "you would",
    "You'd": "You would",
    "he'd": "he would",
    "He'd": "He would",
    "she'd": "she would",
    "She'd": "She would",
    "we'd": "we would",
    "We'd": "We would",
    "they'd": "they would",
    "They'd": "They would",
    "I'll": "I will",
    "you'll": "you will",
    "You'll": "You will",
    "he'll": "he will",
    "He'll": "He will",
    "she'll": "she will",
    "She'll": "She will",
    "we'll": "we will",
    "We'll": "We will",
    "they'll": "they will",
    "They'll": "They will",
    "I've": "I have",
    "you've": "you have",
    "You've": "You have",
    "we've": "we have",
    "We've": "We have",
    "they've": "they have",
    "They've": "They have",
}

count = 0
for old, new in replacements.items():
    if old in content:
        count += content.count(old)
        content = content.replace(old, new)

print(f"✅ Replaced {count} contractions with expanded forms")

# Also replace any remaining fancy apostrophes with regular ones
fancy_count = content.count('\u2019') + content.count('\u2018')
content = content.replace('\u2019', "'")
content = content.replace('\u2018', "'")
print(f"✅ Replaced {fancy_count} fancy apostrophes")

# Write back
with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nTesting syntax...")
import py_compile
try:
    py_compile.compile('main.py', doraise=True)
    print("✅ Syntax check PASSED! Ready to push.")
except SyntaxError as e:
    print(f"❌ Syntax error at line {e.lineno}: {e.msg}")
    if e.text:
        print(f"   {e.text.strip()}")
