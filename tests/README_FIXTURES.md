# Test Fixtures and Generators

This directory contains comprehensive test fixtures and generators for the Nhaka 2.0 Archive Resurrection system.

## Files Created

### Python Backend Testing

#### `tests/fixtures.py`
Provides reusable test data for Python backend testing.

**Features:**
- Sample text data (Doke orthography, modern Shona, historical documents)
- Agent message fixtures for all 5 agents
- Text segment fixtures (high/medium/low confidence)
- Repair recommendation fixtures
- Damage hotspot fixtures
- Context fixtures (empty, after each agent, complete)
- Resurrection result fixtures
- Helper functions for creating custom test data

**Usage:**
```python
from tests.fixtures import (
    sample_agent_messages,
    sample_resurrection_result,
    SAMPLE_DOKE_TEXT
)

def test_my_feature(sample_agent_messages):
    # Use the fixture
    assert len(sample_agent_messages) == 10
```

#### `tests/generators.py`
Hypothesis generators for property-based testing.

**Features:**
- `arbitrary_text()` - Random text with optional Doke characters
- `arbitrary_confidence()` - Confidence scores (0-100)
- `arbitrary_coordinates()` - X/Y coordinates (0-100)
- `arbitrary_agent_message()` - Valid AgentMessage instances
- `arbitrary_text_segment()` - Valid TextSegment instances
- `arbitrary_repair_recommendation()` - Valid RepairRecommendation instances
- `arbitrary_damage_hotspot()` - Valid DamageHotspot instances
- `arbitrary_resurrection_result()` - Complete ResurrectionResult instances
- Specialized generators (text with Doke, historical figures, dates)
- Edge case generators (empty text, extreme values)

**Usage:**
```python
from hypothesis import given
from tests.generators import arbitrary_confidence

@given(confidence=arbitrary_confidence())
def test_confidence_bounds(confidence):
    assert 0 <= confidence <= 100
```

### TypeScript Frontend Testing

#### `tests/testUtils.tsx`
Comprehensive utilities for React component testing.

**Features:**
- `renderWithProviders()` - Custom render with TooltipProvider
- SSE mock utilities:
  - `createMockSSEStream()` - Mock SSE ReadableStream
  - `createMockSSEResponse()` - Mock fetch Response
  - `mockFetchSSE()` - Mock global fetch for SSE
- Sample data generators:
  - `generateSampleMessages()` - Agent messages
  - `generateSampleResult()` - Resurrection results
  - `generateCompleteEvent()` - SSE complete events
- User interaction helpers:
  - `createMockFile()` - Mock File objects
  - `createDragEvent()` - Drag and drop events
  - `wait()` - Async delays
  - `waitForElement()` - Wait for DOM elements
- Assertion helpers:
  - `expectConfidenceFormat()` - Check confidence display
  - `expectHotspotPosition()` - Check AR hotspot positioning
  - `expectAllAgentsPresent()` - Verify all agents in messages
- Fast-check generators:
  - `arbitraryAgentType()` - Random agent types
  - `arbitraryConfidence()` - Random confidence scores
  - `arbitraryCoordinates()` - Random coordinates
  - `arbitraryAgentMessage()` - Random agent messages
  - `arbitraryDamageHotspot()` - Random damage hotspots
  - `arbitraryResurrectionResult()` - Random results
- Component-specific helpers:
  - `setupAgentTheaterTest()` - AgentTheater test setup
  - `setupProcessingSectionTest()` - ProcessingSection test setup
  - `setupDocumentPreviewTest()` - DocumentPreview test setup

**Usage:**
```typescript
import { render, screen } from '@/tests/testUtils';
import { mockFetchSSE, generateSampleMessages } from '@/tests/testUtils';

test('AgentTheater displays messages', () => {
  const messages = generateSampleMessages(5);
  const cleanup = mockFetchSSE(messages);
  
  render(<AgentTheater messages={messages} />);
  
  expect(screen.getByText(/Test message 1/)).toBeInTheDocument();
  
  cleanup();
});
```

## Verification

Run the verification test to ensure all fixtures and generators work:

```bash
# Python fixtures and generators
python -m pytest tests/unit/test_fixtures_verification.py -v

# Expected output: 16 passed
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **10.1, 10.2, 10.3, 10.4, 10.5**: Data model fixtures for all Pydantic models
- **All property-based test requirements**: Hypothesis generators for comprehensive input coverage
- **12.1, 12.2, 12.3, 12.4, 12.5**: TypeScript utilities for frontend component testing

## Next Steps

These fixtures and generators are now ready to be used in:

1. **Unit tests** (Task 3+) - Test specific examples and edge cases
2. **Property-based tests** (Task 4+) - Test universal properties across randomized inputs
3. **Integration tests** (Task 18+) - Test component interactions

## Design Principles

1. **Reusability**: All fixtures can be used across multiple tests
2. **Completeness**: Covers all data models and components
3. **Flexibility**: Helper functions allow creating custom test data
4. **Type Safety**: TypeScript utilities are fully typed
5. **Property-Based**: Generators support comprehensive randomized testing
6. **Realistic**: Sample data reflects actual historical documents

## Examples

### Python Example: Using Fixtures
```python
def test_agent_message_serialization(sample_scanner_message):
    # Fixture provides a complete AgentMessage
    json_data = sample_scanner_message.model_dump()
    assert json_data['agent'] == 'scanner'
    assert 'message' in json_data
```

### Python Example: Using Generators
```python
from hypothesis import given
from tests.generators import arbitrary_damage_hotspot

@given(hotspot=arbitrary_damage_hotspot())
def test_hotspot_coordinates_in_bounds(hotspot):
    # Property: All hotspots must have coordinates 0-100
    assert 0 <= hotspot.x <= 100
    assert 0 <= hotspot.y <= 100
```

### TypeScript Example: Component Testing
```typescript
import { render, screen, mockFetchSSE } from '@/tests/testUtils';

test('ProcessingSection handles file upload', async () => {
  const { file, messages, completeEvent, mockFetch } = setupProcessingSectionTest();
  const cleanup = mockFetch();
  
  render(<ProcessingSection />);
  
  // Simulate file upload
  const input = screen.getByLabelText(/upload/i);
  fireEvent.change(input, { target: { files: [file] } });
  
  // Verify processing starts
  expect(screen.getByText(/processing/i)).toBeInTheDocument();
  
  cleanup();
});
```

### TypeScript Example: Property-Based Testing
```typescript
import { fc, test } from '@fast-check/vitest';
import { arbitraryConfidence } from '@/tests/testUtils';

test.prop([arbitraryConfidence()])('confidence displays as percentage', (confidence) => {
  const formatted = `${confidence.toFixed(1)}%`;
  expect(formatted).toMatch(/^\d+\.\d%$/);
});
```
