"""
Property-based tests for LinguistAgent context propagation.

Feature: code-quality-validation, Property 3: Context Propagation (Linguist)
Validates: Requirements 3.3
"""
import pytest
import asyncio
from datetime import datetime
from hypothesis import given, settings
from hypothesis import strategies as st

# Import from main.py and generators
import sys
sys.path.insert(0, '.')
from main import LinguistAgent
from tests.generators import arbitrary_text, arbitrary_text_with_doke


# =============================================================================
# PROPERTY 3: CONTEXT PROPAGATION (LINGUIST)
# =============================================================================

@given(text=arbitrary_text(min_length=10, max_length=500))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_context_propagation(text):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Linguist)
    Validates: Requirements 3.3
    
    Property: For any agent that completes successfully, the context dictionary should
    contain all fields that agent is responsible for populating.
    
    For Linguist, the required fields are:
    - transliterated_text
    - linguistic_changes
    - historical_terms
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert: All required fields should be populated
    assert "transliterated_text" in context, \
        "Linguist should populate 'transliterated_text' field"
    assert "linguistic_changes" in context, \
        "Linguist should populate 'linguistic_changes' field"
    assert "historical_terms" in context, \
        "Linguist should populate 'historical_terms' field"
    
    # Assert: Fields should have correct types
    assert isinstance(context["transliterated_text"], str), \
        "transliterated_text should be a string"
    assert isinstance(context["linguistic_changes"], list), \
        "linguistic_changes should be a list"
    assert isinstance(context["historical_terms"], list), \
        "historical_terms should be a list"
    
    # Assert: At least one message should be emitted
    assert len(messages) > 0, "Linguist should emit at least one message"


@given(text=arbitrary_text_with_doke(min_doke=1, max_doke=5))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_context_with_doke_characters(text):
    """
    Property: When Linguist processes text with Doke characters, the context should
    contain non-empty linguistic_changes list.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert: linguistic_changes should not be empty
    assert "linguistic_changes" in context
    assert len(context["linguistic_changes"]) > 0, \
        "linguistic_changes should contain entries when Doke characters are present"
    
    # Assert: Each change should be a tuple with 3 elements
    for change in context["linguistic_changes"]:
        assert isinstance(change, tuple), "Each change should be a tuple"
        assert len(change) == 3, "Each change should have 3 elements (orig, modern, reason)"
        orig, modern, reason = change
        assert isinstance(orig, str), "Original character should be a string"
        assert isinstance(modern, str), "Modern equivalent should be a string"
        assert isinstance(reason, str), "Reason should be a string"


@given(
    text=arbitrary_text(min_length=10, max_length=300),
    extra_fields=st.dictionaries(
        keys=st.text(min_size=1, max_size=20),
        values=st.one_of(st.integers(), st.text(max_size=50), st.floats(allow_nan=False)),
        max_size=5
    )
)
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_preserves_existing_context(text, extra_fields):
    """
    Property: Linguist should not remove or modify existing context fields,
    only add its own fields.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow(),
        **extra_fields
    }
    
    # Store original keys
    original_keys = set(context.keys())
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert: All original keys should still be present
    for key in original_keys:
        assert key in context, f"Original context key '{key}' should be preserved"
    
    # Assert: New keys should be added
    assert "transliterated_text" in context
    assert "linguistic_changes" in context
    assert "historical_terms" in context


@given(text=arbitrary_text(min_length=0, max_length=500))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_context_always_populated(text):
    """
    Property: Linguist should always populate its required context fields,
    even for edge cases like empty text.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert: Required fields should always be present
    assert "transliterated_text" in context, \
        "transliterated_text should be populated even for edge cases"
    assert "linguistic_changes" in context, \
        "linguistic_changes should be populated even for edge cases"
    assert "historical_terms" in context, \
        "historical_terms should be populated even for edge cases"


@given(text=arbitrary_text(min_length=10, max_length=300))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_transliterated_text_not_none(text):
    """
    Property: The transliterated_text field should never be None, it should
    always be a string (possibly empty).
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert context["transliterated_text"] is not None, \
        "transliterated_text should never be None"
    assert isinstance(context["transliterated_text"], str), \
        "transliterated_text should always be a string"


@given(text=arbitrary_text(min_length=10, max_length=300))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_changes_list_structure(text):
    """
    Property: The linguistic_changes list should always be a list,
    and if non-empty, each element should be a valid change tuple.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert isinstance(context["linguistic_changes"], list), \
        "linguistic_changes should be a list"
    
    # If there are changes, verify structure
    for change in context["linguistic_changes"]:
        assert isinstance(change, tuple), "Each change should be a tuple"
        assert len(change) == 3, "Each change should have exactly 3 elements"
        orig, modern, reason = change
        assert len(orig) > 0, "Original character should not be empty"
        assert len(modern) > 0, "Modern equivalent should not be empty"
        assert len(reason) > 0, "Reason should not be empty"


@given(text=arbitrary_text(min_length=10, max_length=300))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_historical_terms_list_structure(text):
    """
    Property: The historical_terms list should always be a list,
    and if non-empty, each element should be a valid term tuple.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert isinstance(context["historical_terms"], list), \
        "historical_terms should be a list"
    
    # If there are terms, verify structure
    for term_entry in context["historical_terms"]:
        assert isinstance(term_entry, tuple), "Each term entry should be a tuple"
        assert len(term_entry) == 2, "Each term entry should have exactly 2 elements"
        term, mapping = term_entry
        assert isinstance(term, str), "Term should be a string"
        assert isinstance(mapping, tuple), "Mapping should be a tuple"
        assert len(mapping) == 2, "Mapping should have 2 elements (modern, note)"


# =============================================================================
# EDGE CASE PROPERTY TESTS
# =============================================================================

@given(text=st.just(''))
@settings(max_examples=10, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_context_with_empty_text(text):
    """
    Property: Linguist should handle empty text gracefully and still populate
    all required context fields.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert: All fields should be populated
    assert "transliterated_text" in context
    assert "linguistic_changes" in context
    assert "historical_terms" in context
    
    # Assert: Values should be appropriate for empty text
    assert context["transliterated_text"] == ''
    assert len(context["linguistic_changes"]) == 0
    assert len(context["historical_terms"]) == 0


@given(text=st.text(alphabet=st.sampled_from(['ɓ', 'ɗ', 'ȿ', 'ɀ']), min_size=1, max_size=20))
@settings(max_examples=100, deadline=None)
@pytest.mark.asyncio
async def test_property_linguist_context_with_only_doke(text):
    """
    Property: When text contains only Doke characters, Linguist should still
    populate all context fields correctly.
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": text,
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert: All fields should be populated
    assert "transliterated_text" in context
    assert "linguistic_changes" in context
    assert "historical_terms" in context
    
    # Assert: Changes should be recorded
    assert len(context["linguistic_changes"]) > 0, \
        "Should have changes when text contains only Doke characters"
    
    # Assert: Transliterated text should not contain Doke characters
    for doke_char in linguist.TRANSLITERATION_MAP.keys():
        assert doke_char not in context["transliterated_text"]
