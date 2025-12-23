"""
Property-based tests for Validator inconsistency detection.

Feature: code-quality-validation, Property 12: Validator Inconsistency Detection
Validates: Requirements 5.3
"""
import pytest
from datetime import datetime
from hypothesis import given, strategies as st, settings

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import ValidatorAgent

# Import generators
from tests.generators import arbitrary_text


# =============================================================================
# PROPERTY 12: VALIDATOR INCONSISTENCY DETECTION
# =============================================================================

@given(
    raw_text=arbitrary_text(min_length=10, max_length=100),
    transliterated_text=arbitrary_text(min_length=200, max_length=500)
)
@settings(max_examples=100)
@pytest.mark.asyncio
async def test_property_validator_detects_length_inconsistency(raw_text, transliterated_text):
    """
    Feature: code-quality-validation, Property 12: Validator Inconsistency Detection
    Validates: Requirements 5.3
    
    Property: For any context where the transliterated_text length differs from 
    raw_text length by more than 30%, the Validator should flag an inconsistency.
    """
    # Arrange
    validator = ValidatorAgent()
    
    # Calculate length difference
    len_diff = abs(len(raw_text) - len(transliterated_text)) / max(len(raw_text), 1)
    
    context = {
        "raw_text": raw_text,
        "transliterated_text": transliterated_text,
        "ocr_confidence": 75.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    if len_diff > 0.3:
        # Should detect inconsistency
        inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
        assert len(inconsistency_messages) > 0, \
            f"Should detect inconsistency when length diff is {len_diff:.2%} (> 30%)"
        
        # Inconsistency should be marked as debate
        assert any(m.is_debate for m in inconsistency_messages), \
            "Inconsistency messages should be marked as debate"
    else:
        # Should not detect inconsistency
        inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
        assert len(inconsistency_messages) == 0, \
            f"Should not detect inconsistency when length diff is {len_diff:.2%} (<= 30%)"


@given(
    text=arbitrary_text(min_length=50, max_length=200)
)
@settings(max_examples=100)
@pytest.mark.asyncio
async def test_property_validator_no_inconsistency_for_same_text(text):
    """
    Feature: code-quality-validation, Property 12: Validator Inconsistency Detection
    Validates: Requirements 5.3
    
    Property: For any text where raw_text and transliterated_text are identical,
    the Validator should not flag any inconsistency.
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,  # Same text
        "ocr_confidence": 75.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert - Should not detect any inconsistency
    inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
    assert len(inconsistency_messages) == 0, \
        "Should not detect inconsistency when texts are identical"


@given(
    base_text=arbitrary_text(min_length=100, max_length=200),
    variation_percent=st.floats(min_value=0.0, max_value=0.29)
)
@settings(max_examples=100)
@pytest.mark.asyncio
async def test_property_validator_no_inconsistency_within_threshold(base_text, variation_percent):
    """
    Feature: code-quality-validation, Property 12: Validator Inconsistency Detection
    Validates: Requirements 5.3
    
    Property: For any text where the length difference is within 30% threshold,
    the Validator should not flag an inconsistency.
    """
    # Arrange
    validator = ValidatorAgent()
    
    # Create a variation that's within the threshold
    target_length = int(len(base_text) * (1 + variation_percent))
    if target_length > len(base_text):
        varied_text = base_text + "x" * (target_length - len(base_text))
    else:
        varied_text = base_text[:target_length]
    
    context = {
        "raw_text": base_text,
        "transliterated_text": varied_text,
        "ocr_confidence": 75.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert - Should not detect inconsistency
    inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
    assert len(inconsistency_messages) == 0, \
        f"Should not detect inconsistency when variation is {variation_percent:.2%} (<= 30%)"


@given(
    base_text=arbitrary_text(min_length=50, max_length=100),
    multiplier=st.floats(min_value=2.0, max_value=5.0)
)
@settings(max_examples=100)
@pytest.mark.asyncio
async def test_property_validator_detects_large_expansion(base_text, multiplier):
    """
    Feature: code-quality-validation, Property 12: Validator Inconsistency Detection
    Validates: Requirements 5.3
    
    Property: For any text that expands by more than 30% during transliteration,
    the Validator should flag an inconsistency.
    """
    # Arrange
    validator = ValidatorAgent()
    
    # Create expanded text (multiply length)
    target_length = int(len(base_text) * multiplier)
    expanded_text = base_text + "x" * (target_length - len(base_text))
    
    context = {
        "raw_text": base_text,
        "transliterated_text": expanded_text,
        "ocr_confidence": 75.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert - Should detect inconsistency
    inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
    assert len(inconsistency_messages) > 0, \
        f"Should detect inconsistency when text expands by {multiplier}x (> 30%)"


@given(
    base_text=arbitrary_text(min_length=100, max_length=200),
    reduction_percent=st.floats(min_value=0.4, max_value=0.8)
)
@settings(max_examples=100)
@pytest.mark.asyncio
async def test_property_validator_detects_large_reduction(base_text, reduction_percent):
    """
    Feature: code-quality-validation, Property 12: Validator Inconsistency Detection
    Validates: Requirements 5.3
    
    Property: For any text that shrinks by more than 30% during transliteration,
    the Validator should flag an inconsistency.
    """
    # Arrange
    validator = ValidatorAgent()
    
    # Create reduced text
    target_length = int(len(base_text) * reduction_percent)
    reduced_text = base_text[:max(1, target_length)]
    
    context = {
        "raw_text": base_text,
        "transliterated_text": reduced_text,
        "ocr_confidence": 75.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert - Should detect inconsistency
    inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
    assert len(inconsistency_messages) > 0, \
        f"Should detect inconsistency when text reduces to {reduction_percent:.2%} (> 30% change)"
