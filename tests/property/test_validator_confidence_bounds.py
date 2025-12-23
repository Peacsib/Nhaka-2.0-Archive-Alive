"""
Property-based tests for Validator confidence score bounds.

Feature: code-quality-validation, Property 8: Confidence Score Bounds
Validates: Requirements 5.1
"""
import pytest
from datetime import datetime
from hypothesis import given, strategies as st, settings
from unittest.mock import AsyncMock, patch

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import ValidatorAgent

# Import generators
from tests.generators import arbitrary_confidence, arbitrary_text


# =============================================================================
# PROPERTY 8: CONFIDENCE SCORE BOUNDS
# =============================================================================

@given(
    ocr_confidence=arbitrary_confidence()
)
@settings(max_examples=20, deadline=None)
@pytest.mark.asyncio
async def test_property_confidence_scores_within_bounds(ocr_confidence):
    """
    Feature: code-quality-validation, Property 8: Confidence Score Bounds
    Validates: Requirements 5.1
    
    Property: For any confidence score in the system (OCR confidence, final confidence),
    the value should be between 0 and 100 inclusive.
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Some text",
        "transliterated_text": "Some text",
        "ocr_confidence": ocr_confidence,
        "verified_facts": ["Fact 1"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls to avoid real API calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Act
        messages = []
        async for msg in validator.process(context):
            messages.append(msg)
        
        # Assert - Check that final confidence is within bounds
        assert "final_confidence" in context, "Should populate final_confidence"
        final_confidence = context["final_confidence"]
        
        assert 0 <= final_confidence <= 100, \
            f"Final confidence {final_confidence} should be between 0 and 100"
        
        # Check that all message confidences are within bounds
        for msg in messages:
            if msg.confidence is not None:
                assert 0 <= msg.confidence <= 100, \
                    f"Message confidence {msg.confidence} should be between 0 and 100"


@given(
    text=arbitrary_text(min_length=20, max_length=100)
)
@settings(max_examples=20, deadline=None)
@pytest.mark.asyncio
async def test_property_final_confidence_always_valid(text):
    """
    Feature: code-quality-validation, Property 8: Confidence Score Bounds
    Validates: Requirements 5.1
    
    Property: For any valid context, the calculated final_confidence should
    always be a valid number between 0 and 100.
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "ocr_confidence": 75.0,
        "verified_facts": ["Fact 1", "Fact 2"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls to avoid real API calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Act
        messages = []
        async for msg in validator.process(context):
            messages.append(msg)
        
        # Assert
        assert "final_confidence" in context
        final_confidence = context["final_confidence"]
        
        # Check it's a valid number
        assert isinstance(final_confidence, (int, float)), \
            "Final confidence should be a number"
        assert not (isinstance(final_confidence, float) and 
                    (final_confidence != final_confidence or  # NaN check
                     final_confidence == float('inf') or 
                     final_confidence == float('-inf'))), \
            "Final confidence should not be NaN or infinity"
        
        # Check bounds
        assert 0 <= final_confidence <= 100, \
            f"Final confidence {final_confidence} should be between 0 and 100"


@given(
    ocr_conf=st.floats(min_value=-100.0, max_value=200.0, allow_nan=False, allow_infinity=False)
)
@settings(max_examples=20, deadline=None)
@pytest.mark.asyncio
async def test_property_handles_out_of_range_input_gracefully(ocr_conf):
    """
    Feature: code-quality-validation, Property 8: Confidence Score Bounds
    Validates: Requirements 5.1
    
    Property: Even when given out-of-range confidence inputs, the Validator
    should produce a final_confidence within valid bounds (0-100).
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Text",
        "transliterated_text": "Text",
        "ocr_confidence": ocr_conf,  # May be out of range
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls to avoid real API calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Act
        messages = []
        async for msg in validator.process(context):
            messages.append(msg)
        
        # Assert - Final confidence should still be valid
        assert "final_confidence" in context
        final_confidence = context["final_confidence"]
        
        # Should be within bounds regardless of input
        assert 0 <= final_confidence <= 100, \
            f"Final confidence {final_confidence} should be between 0 and 100 even with input {ocr_conf}"


@given(
    num_facts=st.integers(min_value=0, max_value=20),
    num_warnings=st.integers(min_value=0, max_value=10)
)
@settings(max_examples=20, deadline=None)
@pytest.mark.asyncio
async def test_property_confidence_calculation_always_valid(num_facts, num_warnings):
    """
    Feature: code-quality-validation, Property 8: Confidence Score Bounds
    Validates: Requirements 5.1
    
    Property: For any combination of verified facts and warnings, the calculated
    final confidence should be within valid bounds.
    """
    # Arrange
    validator = ValidatorAgent()
    validator.warnings = [f"Warning {i}" for i in range(num_warnings)]
    
    context = {
        "raw_text": "Text",
        "transliterated_text": "Text",
        "ocr_confidence": 75.0,
        "verified_facts": [f"Fact {i}" for i in range(num_facts)],
        "historical_anomalies": [],
        "validator_warnings": validator.warnings,
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls to avoid real API calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Act
        messages = []
        async for msg in validator.process(context):
            messages.append(msg)
        
        # Assert
        final_confidence = context["final_confidence"]
        
        assert 0 <= final_confidence <= 100, \
            f"Final confidence {final_confidence} should be between 0 and 100 " \
            f"(facts={num_facts}, warnings={num_warnings})"


@given(
    ocr_confidence=arbitrary_confidence()
)
@settings(max_examples=100, deadline=None)
def test_property_calculate_final_confidence_bounds(ocr_confidence):
    """
    Feature: code-quality-validation, Property 8: Confidence Score Bounds
    Validates: Requirements 5.1
    
    Property: The _calculate_final_confidence method should always return
    a value between 0 and 100 for any valid input.
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "ocr_confidence": ocr_confidence,
        "verified_facts": ["Fact 1", "Fact 2"],
        "validator_warnings": []
    }
    
    # Act
    final_confidence = validator._calculate_final_confidence(context)
    
    # Assert
    assert 0 <= final_confidence <= 100, \
        f"Calculated confidence {final_confidence} should be between 0 and 100"
    assert isinstance(final_confidence, (int, float)), \
        "Confidence should be a number"
