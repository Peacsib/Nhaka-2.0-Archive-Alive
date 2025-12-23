"""
Unit tests for LinguistAgent.
Tests specific examples, edge cases, and error conditions.

Requirements: 3.4, 3.5
"""
import pytest
import asyncio
from datetime import datetime

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import LinguistAgent, AgentType


# =============================================================================
# UNIT TESTS - SPECIFIC EXAMPLES
# =============================================================================

@pytest.mark.asyncio
async def test_linguist_with_no_doke_characters():
    """
    Test Linguist with no Doke characters (example).
    
    Requirements: 3.4, 3.5
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": "This is a modern text with no Doke characters. Just standard Latin script.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that "No Doke characters found" message is present
    no_doke_messages = [m for m in messages if "No Doke characters found" in m.message]
    assert len(no_doke_messages) > 0, "Should indicate no Doke characters found"
    
    # Check context is populated
    assert "transliterated_text" in context, "Should populate transliterated_text"
    assert context["transliterated_text"] == context["raw_text"], "Text should be unchanged"
    
    # Check no changes were made
    assert "linguistic_changes" in context
    assert len(context["linguistic_changes"]) == 0, "Should have no changes"


@pytest.mark.asyncio
async def test_linguist_with_historical_terms():
    """
    Test Linguist with historical terms (example).
    
    Requirements: 3.4, 3.5
    """
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": "The Matabele people lived in kraals. Lobola was an important tradition.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that historical terms are identified
    term_messages = [m for m in messages if "HISTORICAL TERMS" in m.message]
    assert len(term_messages) > 0, "Should identify historical terms"
    
    # Check context contains historical terms
    assert "historical_terms" in context
    assert len(context["historical_terms"]) > 0, "Should find historical terms"
    
    # Verify specific terms found
    term_names = [term[0] for term in context["historical_terms"]]
    assert "Matabele" in term_names or "kraal" in term_names, "Should find Matabele or kraal"


@pytest.mark.asyncio
async def test_linguist_with_mixed_doke_and_modern_text():
    """
    Test Linguist with mixed Doke and modern text.
    
    Requirements: 3.4, 3.5
    """
    # Arrange
    linguist = LinguistAgent()
    # Text with Doke characters: ɓ, ɗ, ȿ
    context = {
        "raw_text": "Ini Loɓengula, Mamɓo weMataɓele. This has ɗoke and ȿome characters.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that transliteration occurred
    transliteration_messages = [m for m in messages if "TRANSLITERATION" in m.message]
    assert len(transliteration_messages) > 0, "Should indicate transliteration occurred"
    
    # Check context is populated
    assert "transliterated_text" in context
    assert "linguistic_changes" in context
    assert len(context["linguistic_changes"]) > 0, "Should have changes"
    
    # Verify Doke characters are replaced
    transliterated = context["transliterated_text"]
    assert 'ɓ' not in transliterated, "Should replace ɓ"
    assert 'ɗ' not in transliterated, "Should replace ɗ"
    assert 'ȿ' not in transliterated, "Should replace ȿ"
    
    # Verify replacements are correct
    assert 'b' in transliterated, "Should contain 'b' replacement"
    assert 'd' in transliterated, "Should contain 'd' replacement"
    assert 'sv' in transliterated, "Should contain 'sv' replacement"


# =============================================================================
# UNIT TESTS - EDGE CASES
# =============================================================================

@pytest.mark.asyncio
async def test_linguist_with_empty_text():
    """Test Linguist with empty text."""
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": "",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit messages even with empty text"
    assert "transliterated_text" in context
    assert context["transliterated_text"] == "", "Empty text should remain empty"


@pytest.mark.asyncio
async def test_linguist_with_only_doke_characters():
    """Test Linguist with text containing only Doke characters."""
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": "ɓɗȿɀŋʃʒ",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert "transliterated_text" in context
    transliterated = context["transliterated_text"]
    
    # All Doke characters should be replaced
    assert 'ɓ' not in transliterated
    assert 'ɗ' not in transliterated
    assert 'ȿ' not in transliterated
    assert 'ɀ' not in transliterated
    assert 'ŋ' not in transliterated
    assert 'ʃ' not in transliterated
    assert 'ʒ' not in transliterated


@pytest.mark.asyncio
async def test_linguist_with_multiple_same_doke_character():
    """Test Linguist with multiple instances of the same Doke character."""
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": "ɓɓɓ test ɓɓɓ more ɓɓɓ",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert
    assert "transliterated_text" in context
    transliterated = context["transliterated_text"]
    
    # All ɓ should be replaced with b
    assert 'ɓ' not in transliterated
    assert transliterated.count('b') >= 9, "Should have at least 9 'b' characters"


# =============================================================================
# UNIT TESTS - TRANSLITERATION LOGIC
# =============================================================================

def test_transliterate_method_basic():
    """Test the _transliterate method directly."""
    # Arrange
    linguist = LinguistAgent()
    text = "Test ɓ and ɗ and ȿ"
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert
    assert 'ɓ' not in result
    assert 'ɗ' not in result
    assert 'ȿ' not in result
    assert 'b' in result
    assert 'd' in result
    assert 'sv' in result
    assert len(changes) == 3, "Should have 3 changes"


def test_transliterate_method_no_changes():
    """Test _transliterate with no Doke characters."""
    # Arrange
    linguist = LinguistAgent()
    text = "Normal text with no special characters"
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert
    assert result == text, "Text should be unchanged"
    assert len(changes) == 0, "Should have no changes"


def test_find_historical_terms_method():
    """Test the _find_historical_terms method directly."""
    # Arrange
    linguist = LinguistAgent()
    text = "The Matabele and Mashona people lived in kraals."
    
    # Act
    terms_found = linguist._find_historical_terms(text)
    
    # Assert
    assert len(terms_found) > 0, "Should find historical terms"
    term_names = [term[0] for term in terms_found]
    assert "Matabele" in term_names
    assert "Mashona" in term_names
    assert "kraal" in term_names


def test_find_historical_terms_case_insensitive():
    """Test that historical term detection is case-insensitive."""
    # Arrange
    linguist = LinguistAgent()
    text = "The matabele and MASHONA people lived in KRAAL."
    
    # Act
    terms_found = linguist._find_historical_terms(text)
    
    # Assert
    assert len(terms_found) > 0, "Should find terms regardless of case"


# =============================================================================
# UNIT TESTS - CONTEXT POPULATION
# =============================================================================

@pytest.mark.asyncio
async def test_linguist_populates_all_required_context_fields():
    """Test that Linguist populates all required context fields."""
    # Arrange
    linguist = LinguistAgent()
    context = {
        "raw_text": "Test text with ɓ character and Matabele term",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in linguist.process(context):
        messages.append(msg)
    
    # Assert - Check all required fields are populated
    assert "transliterated_text" in context, "Should populate transliterated_text"
    assert "linguistic_changes" in context, "Should populate linguistic_changes"
    assert "historical_terms" in context, "Should populate historical_terms"
    
    # Verify types
    assert isinstance(context["transliterated_text"], str)
    assert isinstance(context["linguistic_changes"], list)
    assert isinstance(context["historical_terms"], list)


@pytest.mark.asyncio
async def test_linguist_agent_type_and_metadata():
    """Test that Linguist has correct agent type and metadata."""
    # Arrange
    linguist = LinguistAgent()
    
    # Assert
    assert linguist.agent_type == AgentType.LINGUIST
    assert linguist.name == "Linguist"
    assert "Doke" in linguist.description or "orthography" in linguist.description
    
    # Check transliteration map exists
    assert hasattr(linguist, 'TRANSLITERATION_MAP')
    assert len(linguist.TRANSLITERATION_MAP) > 0
    
    # Check historical terms exist
    assert hasattr(linguist, 'HISTORICAL_TERMS')
    assert len(linguist.HISTORICAL_TERMS) > 0
