"""
Property-based tests for HistorianAgent context propagation.

Feature: code-quality-validation, Property 3: Context Propagation (Historian)
Validates: Requirements 4.4
"""
import pytest
from hypothesis import given, settings, strategies as st
from datetime import datetime
import asyncio

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import HistorianAgent

# Import generators
from tests.generators import arbitrary_text, arbitrary_context_dict


# =============================================================================
# PROPERTY 3: CONTEXT PROPAGATION (HISTORIAN)
# =============================================================================

@pytest.mark.asyncio
@given(text=arbitrary_text(min_length=10, max_length=500))
@settings(max_examples=20, deadline=None)
async def test_property_historian_context_propagation(text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any agent that completes successfully, the context dictionary
    should contain all fields that agent is responsible for populating.
    
    For Historian: historian_findings, verified_facts, historical_anomalies
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert - Check all required fields are populated
    assert "historian_findings" in context, \
        "Historian should populate historian_findings"
    assert "verified_facts" in context, \
        "Historian should populate verified_facts"
    assert "historical_anomalies" in context, \
        "Historian should populate historical_anomalies"
    
    # Verify types
    assert isinstance(context["historian_findings"], list), \
        "historian_findings should be a list"
    assert isinstance(context["verified_facts"], list), \
        "verified_facts should be a list"
    assert isinstance(context["historical_anomalies"], list), \
        "historical_anomalies should be a list"


@pytest.mark.asyncio
@given(context_dict=arbitrary_context_dict())
@settings(max_examples=20, deadline=None)
async def test_property_historian_preserves_existing_context(context_dict):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any existing context, the Historian should preserve all
    existing fields while adding its own.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Add required fields for Historian
    context_dict["raw_text"] = context_dict.get("raw_text", "Test text with Lobengula")
    context_dict["start_time"] = context_dict.get("start_time", datetime.utcnow())
    
    # Store original keys
    original_keys = set(context_dict.keys())
    
    # Act
    messages = []
    async for msg in historian.process(context_dict):
        messages.append(msg)
    
    # Assert - All original keys should still be present
    for key in original_keys:
        assert key in context_dict, \
            f"Historian should preserve existing context key: {key}"
    
    # New keys should be added
    assert "historian_findings" in context_dict
    assert "verified_facts" in context_dict
    assert "historical_anomalies" in context_dict


@pytest.mark.asyncio
@given(
    raw_text=arbitrary_text(min_length=10, max_length=300),
    transliterated_text=arbitrary_text(min_length=10, max_length=300)
)
@settings(max_examples=20, deadline=None)
async def test_property_historian_handles_both_text_fields(raw_text, transliterated_text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any context with both raw_text and transliterated_text,
    the Historian should process successfully and populate all required fields.
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": raw_text,
        "transliterated_text": transliterated_text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert "historian_findings" in context
    assert "verified_facts" in context
    assert "historical_anomalies" in context
    
    # Should have at least one message
    assert len(messages) > 0, "Should emit at least one message"


@pytest.mark.asyncio
@given(text=st.text(min_size=10, max_size=500))
@settings(max_examples=20, deadline=None)
async def test_property_historian_context_fields_are_lists(text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any text, the Historian should populate context fields
    as lists (even if empty).
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert - All fields should be lists
    assert isinstance(context["historian_findings"], list)
    assert isinstance(context["verified_facts"], list)
    assert isinstance(context["historical_anomalies"], list)
    
    # Lists should contain only strings (if not empty)
    for item in context["historian_findings"]:
        assert isinstance(item, str), "historian_findings items should be strings"
    
    for item in context["verified_facts"]:
        assert isinstance(item, str), "verified_facts items should be strings"
    
    for item in context["historical_anomalies"]:
        assert isinstance(item, str), "historical_anomalies items should be strings"


@pytest.mark.asyncio
@given(text=arbitrary_text(min_length=10, max_length=500))
@settings(max_examples=20, deadline=None)
async def test_property_historian_emits_messages(text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any text, the Historian should emit at least one message
    during processing.
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Historian should emit at least one message"
    
    # All messages should have required fields
    for msg in messages:
        assert hasattr(msg, 'agent'), "Message should have agent field"
        assert hasattr(msg, 'message'), "Message should have message field"
        assert hasattr(msg, 'timestamp'), "Message should have timestamp field"


@pytest.mark.asyncio
@given(
    text=arbitrary_text(min_length=10, max_length=500),
    has_transliterated=st.booleans()
)
@settings(max_examples=20, deadline=None)
async def test_property_historian_handles_missing_transliterated_text(text, has_transliterated):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any context, the Historian should handle missing
    transliterated_text gracefully and still populate all required fields.
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Optionally add transliterated_text
    if has_transliterated:
        context["transliterated_text"] = text
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert - Should still populate all fields
    assert "historian_findings" in context
    assert "verified_facts" in context
    assert "historical_anomalies" in context


@pytest.mark.asyncio
@given(text=st.just(""))
@settings(max_examples=10, deadline=None)
async def test_property_historian_handles_empty_text(text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For empty text, the Historian should still populate all
    required context fields (even if empty).
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert "historian_findings" in context
    assert "verified_facts" in context
    assert "historical_anomalies" in context
    
    # Should be lists (possibly empty)
    assert isinstance(context["historian_findings"], list)
    assert isinstance(context["verified_facts"], list)
    assert isinstance(context["historical_anomalies"], list)


@pytest.mark.asyncio
@given(
    text=arbitrary_text(min_length=10, max_length=500),
    extra_fields=st.dictionaries(
        keys=st.text(min_size=1, max_size=20),
        values=st.one_of(st.integers(), st.text(max_size=50), st.booleans()),
        max_size=5
    )
)
@settings(max_examples=20, deadline=None)
async def test_property_historian_does_not_overwrite_context(text, extra_fields):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any context with extra fields, the Historian should not
    overwrite or remove those fields.
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow(),
        **extra_fields
    }
    
    # Store original values
    original_values = {k: v for k, v in extra_fields.items()}
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert - Extra fields should be preserved with original values
    for key, original_value in original_values.items():
        assert key in context, f"Extra field '{key}' should be preserved"
        assert context[key] == original_value, \
            f"Extra field '{key}' should have original value"


@pytest.mark.asyncio
@given(text=arbitrary_text(min_length=10, max_length=500))
@settings(max_examples=20, deadline=None)
async def test_property_historian_context_idempotent(text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Historian)
    Validates: Requirements 4.4
    
    Property: For any text, running the Historian twice should produce
    consistent context fields (idempotent operation).
    """
    # Arrange
    historian1 = HistorianAgent()
    historian2 = HistorianAgent()
    
    context1 = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow()
    }
    
    context2 = {
        "raw_text": text,
        "transliterated_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages1 = []
    async for msg in historian1.process(context1):
        messages1.append(msg)
    
    messages2 = []
    async for msg in historian2.process(context2):
        messages2.append(msg)
    
    # Assert - Both contexts should have the same fields
    assert set(context1.keys()) == set(context2.keys()), \
        "Both runs should populate the same context fields"
    
    # Both should have the required fields
    for ctx in [context1, context2]:
        assert "historian_findings" in ctx
        assert "verified_facts" in ctx
        assert "historical_anomalies" in ctx
