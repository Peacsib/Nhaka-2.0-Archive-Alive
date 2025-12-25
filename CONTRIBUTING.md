# 🤝 Contributing to Nhaka 2.0

Thank you for your interest in contributing! This project preserves cultural heritage through AI-powered document restoration.

## 🚀 Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/YOUR_USERNAME/Nhaka-2.0-Archive-Alive.git
cd Nhaka-2.0-Archive-Alive

# 2. Install dependencies
pip install -r requirements.txt
npm install

# 3. Configure
cp .env.example .env
# Add your NOVITA_AI_API_KEY

# 4. Run tests
pytest && npm test

# 5. Start dev servers
uvicorn main:app --reload --port 8000  # Terminal 1
npm run dev                             # Terminal 2
```

## 📝 Code Style

**Python:** PEP 8, type hints, format with `black`
**TypeScript:** ESLint rules, strict mode

## 🧪 Testing

- Backend: 80% coverage minimum
- Frontend: 70% coverage minimum
- All new features need tests

## 💬 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: Add Swahili support
fix: Correct confidence calculation
docs: Update README
test: Add Linguist tests
```

## 🐛 Reporting Bugs

Open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Suggesting Features

Open an issue with:
- Use case description
- Proposed solution
- Alternative approaches considered

## 📧 Contact

Questions? Email peacesibx@gmail.com or open a discussion on GitHub.

---

**Thank you for helping preserve cultural heritage! 🏛️**
