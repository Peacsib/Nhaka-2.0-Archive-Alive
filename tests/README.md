# Nhaka 2.0 Testing Infrastructure

This directory contains the comprehensive test suite for the Nhaka 2.0 Archive Resurrection system.

## Directory Structure

```
tests/
├── unit/           # Unit tests for specific components
├── property/       # Property-based tests for universal correctness
├── integration/    # Integration tests for component interactions
├── setup.ts        # Vitest setup and global test configuration
└── README.md       # This file
```

## Test Types

### Unit Tests (`tests/unit/`)
- Test specific examples and edge cases
- Test error conditions and boundary values
- Focus on individual functions, classes, and components
- Fast execution (< 1 second per test)

### Property-Based Tests (`tests/property/`)
- Test universal correctness properties
- Use Hypothesis (Python) and fast-check (TypeScript)
- Run minimum 100 iterations per property
- Validate behavior across randomized inputs

### Integration Tests (`tests/integration/`)
- Test component interactions
- Test data flow between agents
- Test API endpoints with real logic
- Test frontend-backend communication

## Running Tests

### Python Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test type
pytest -m unit
pytest -m property
pytest -m integration

# Run specific test file
pytest tests/unit/test_scanner.py

# Run with verbose output
pytest -v

# Generate HTML coverage report
pytest --cov --cov-report=html
```

### TypeScript Frontend Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test tests/unit/AgentTheater.test.tsx
```

## Test Configuration

### Python (pytest.ini)
- Minimum coverage: 80% for backend
- Asyncio mode: auto
- Test discovery: `test_*.py` and `*_test.py`
- Markers: unit, property, integration, slow, requires_api

### TypeScript (vitest.config.ts)
- Minimum coverage: 70% for frontend
- Environment: jsdom (for React components)
- Test discovery: `**/*.{test,spec}.{ts,tsx}`
- Timeout: 10 seconds

## Writing Tests

### Unit Test Example (Python)

```python
import pytest
from agents.scanner import ScannerAgent

@pytest.mark.unit
def test_scanner_with_doke_characters():
    """Test Scanner detects Doke orthography characters."""
    scanner = ScannerAgent()
    # Test implementation
    assert result is not None
```

### Property Test Example (Python)

```python
from hypothesis import given, strategies as st

@given(text=st.text())
@pytest.mark.property
def test_transliteration_consistency(text):
    """
    Feature: code-quality-validation, Property 5: Transliteration Consistency
    Validates: Requirements 3.1, 3.2
    """
    # Property test implementation
    assert property_holds
```

### Component Test Example (TypeScript)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentTheater } from '@/components/AgentTheater';

describe('AgentTheater', () => {
  it('renders agent messages correctly', () => {
    render(<AgentTheater messages={[]} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
```

## Test Data

Sample test data should be placed in:
- `tests/fixtures/` - Shared test fixtures
- `tests/data/` - Sample documents and images

## Coverage Goals

- Backend: 80% line coverage, 90% branch coverage
- Frontend: 70% line coverage
- Critical paths: 100% coverage (resurrection pipeline, API endpoints)

## CI/CD Integration

Tests run automatically on:
- Every commit (unit tests)
- Every PR (unit + property tests with 100 iterations)
- Before merge (integration tests)
- Staging deployment (E2E tests)

## Best Practices

1. **Isolation**: Each test should be independent
2. **Determinism**: Tests should produce consistent results
3. **Clarity**: Test names should describe what is being tested
4. **Speed**: Unit tests should be fast
5. **Reliability**: Fix or remove flaky tests

## Mocking Strategy

**Mock External Dependencies**:
- Novita AI API
- Supabase
- File system operations

**Do Not Mock**:
- Internal agent logic
- Data models
- Context passing

## Property Test Tags

Each property test must include a comment with:
```python
# Feature: code-quality-validation, Property N: [property description]
# Validates: Requirements X.Y, X.Z
```

This ensures traceability from requirements → design → tests.
