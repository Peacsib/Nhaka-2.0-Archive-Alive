# Testing Infrastructure Setup

This document describes the testing infrastructure for the Nhaka 2.0 Archive Resurrection system.

## ✅ Installed Dependencies

### Python Backend
- **pytest** (9.0.2): Testing framework
- **pytest-asyncio** (1.3.0): Async test support
- **pytest-cov** (7.0.0): Code coverage reporting
- **hypothesis** (6.148.8): Property-based testing

### TypeScript Frontend
- **vitest** (4.0.16): Fast unit test framework
- **@vitest/ui**: Interactive test UI
- **@fast-check/vitest**: Property-based testing for TypeScript
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **jsdom**: DOM implementation for Node.js

## 📁 Directory Structure

```
tests/
├── unit/              # Unit tests for specific components
│   ├── test_setup.py  # Python setup verification
│   └── setup.test.ts  # TypeScript setup verification
├── property/          # Property-based tests (Hypothesis/fast-check)
├── integration/       # Integration tests for component interactions
├── setup.ts           # Vitest global setup
└── README.md          # Testing documentation
```

## ⚙️ Configuration Files

### pytest.ini
- Test discovery patterns
- Test markers (unit, property, integration, slow, requires_api, asyncio)
- Coverage configuration
- Warning filters

### vitest.config.ts
- jsdom environment for React testing
- Coverage thresholds (70% for frontend)
- Test file patterns
- Path aliases (@/ → ./src)

### tests/setup.ts
- Global test setup for Vitest
- Mock window.matchMedia
- Mock IntersectionObserver
- Mock ResizeObserver

## 🚀 Running Tests

### Python Tests

```bash
# Run all tests
pytest

# Run specific test type
pytest -m unit
pytest -m property
pytest -m integration

# Run with coverage
pytest --cov --cov-report=html

# Run specific file
pytest tests/unit/test_setup.py -v
```

### TypeScript Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific file
npm test tests/unit/setup.test.ts
```

### Run All Tests

```bash
# Using Python script
python run_tests.py

# Or manually
pytest tests/ -v -m unit && npm test
```

## ✅ Verification

Both test suites have been verified and are working correctly:

### Python Tests (3/3 passed)
- ✅ pytest is working
- ✅ Hypothesis is installed and importable
- ✅ pytest-asyncio supports async tests

### TypeScript Tests (4/4 passed)
- ✅ Vitest runs basic tests
- ✅ @testing-library/react is available
- ✅ fast-check is available
- ✅ Property-based testing works

## 📊 Coverage Goals

- **Backend**: 80% line coverage, 90% branch coverage
- **Frontend**: 70% line coverage
- **Critical Paths**: 100% coverage (resurrection pipeline, API endpoints)

## 🏷️ Test Markers

### Python (pytest)
- `@pytest.mark.unit`: Unit tests
- `@pytest.mark.property`: Property-based tests
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.slow`: Slow-running tests
- `@pytest.mark.requires_api`: Tests requiring external APIs
- `@pytest.mark.asyncio`: Async tests

### TypeScript (Vitest)
- Use `describe()` blocks to organize tests
- Use `it()` or `test()` for individual test cases
- Use `fc.property()` for property-based tests

## 📝 Writing Tests

### Python Unit Test Example

```python
import pytest

@pytest.mark.unit
def test_example():
    """Test description."""
    assert True
```

### Python Property Test Example

```python
from hypothesis import given, strategies as st

@given(text=st.text())
@pytest.mark.property
def test_property_example(text):
    """
    Feature: code-quality-validation, Property N: Description
    Validates: Requirements X.Y
    """
    assert len(text) >= 0
```

### TypeScript Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### TypeScript Property Test Example

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Property Tests', () => {
  it('should satisfy property', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        return str.length >= 0;
      })
    );
  });
});
```

## 🔧 Next Steps

1. ✅ Testing infrastructure set up
2. ⏳ Create test fixtures and generators (Task 2)
3. ⏳ Implement data model validation tests (Task 3)
4. ⏳ Implement agent tests (Tasks 4-8)
5. ⏳ Implement orchestrator tests (Task 10)
6. ⏳ Implement cache tests (Task 11)
7. ⏳ Implement API endpoint tests (Task 12)
8. ⏳ Implement frontend component tests (Tasks 14-16)
9. ⏳ Implement integration tests (Task 18)
10. ⏳ Set up CI/CD pipeline (Task 19)

## 📚 Resources

- [pytest documentation](https://docs.pytest.org/)
- [Hypothesis documentation](https://hypothesis.readthedocs.io/)
- [Vitest documentation](https://vitest.dev/)
- [fast-check documentation](https://fast-check.dev/)
- [Testing Library documentation](https://testing-library.com/)

## 🎯 Success Criteria

- [x] Python testing dependencies installed
- [x] TypeScript testing dependencies installed
- [x] pytest.ini configuration created
- [x] vitest.config.ts configuration created
- [x] Test directory structure created
- [x] Python tests verified (3/3 passing)
- [x] TypeScript tests verified (4/4 passing)
- [x] Documentation created

The testing infrastructure is now ready for implementing the comprehensive test suite!
