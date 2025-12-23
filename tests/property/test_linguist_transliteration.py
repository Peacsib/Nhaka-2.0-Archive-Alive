"""
Property-based tests for LinguistAgent transliteration consistency.

Feature: code-quality-validation, Property 5: Transliteration Consistency
Validates: Requirements 3.1, 3.2
"""
import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

# Import from main.py and generators
import sys
sys.path.insert(0, '.')
from main import LinguistAgent
from tests.generators import arbitrary_text_with_doke


# =============================================================================
# PROPERTY 5: TRANSLITERATION CONSISTENCY
# =============================================================================

@given(text=arbitrary_text_with_doke(min_doke=1, max_doke=10))
@settings(max_examples=100)
def test_property_transliteration_consistency(text):
    """
    Feature: code-quality-validation, Property 5: Transliteration Consistency
    Validates: Requirements 3.1, 3.2
    
    Property: For any text containing Doke orthography characters (ɓ, ɗ, ȿ, ɀ, ŋ, ʃ, ʒ),
    applying the Linguist's transliteration should replace all Doke characters with their
    modern equivalents according to the TRANSLITERATION_MAP.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert: All Doke characters should be replaced
    for doke_char in linguist.TRANSLITERATION_MAP.keys():
        assert doke_char not in result, \
            f"Doke character '{doke_char}' should be replaced in result"
    
    # Assert: Number of changes should match number of Doke characters in original text
    doke_count = sum(text.count(char) for char in linguist.TRANSLITERATION_MAP.keys())
    assert len(changes) == len(set([char for char in linguist.TRANSLITERATION_MAP.keys() if char in text])), \
        f"Should record one change entry per unique Doke character type found"
    
    # Assert: Each change should be valid
    for orig, modern, reason in changes:
        assert orig in linguist.TRANSLITERATION_MAP, \
            f"Original character '{orig}' should be in TRANSLITERATION_MAP"
        assert linguist.TRANSLITERATION_MAP[orig] == modern, \
            f"Modern equivalent should match TRANSLITERATION_MAP: {orig} -> {modern}"
        assert isinstance(reason, str) and len(reason) > 0, \
            "Reason should be a non-empty string"


@given(text=arbitrary_text_with_doke(min_doke=1, max_doke=5))
@settings(max_examples=100)
def test_property_transliteration_idempotence(text):
    """
    Property: Transliterating text twice should produce the same result as transliterating once.
    
    This tests idempotence: transliterate(transliterate(x)) == transliterate(x)
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Act
    result1, changes1 = linguist._transliterate(text)
    result2, changes2 = linguist._transliterate(result1)
    
    # Assert: Second transliteration should produce no changes
    assert result1 == result2, "Transliterating twice should produce same result"
    assert len(changes2) == 0, "Second transliteration should have no changes"


@given(text=st.text(min_size=10, max_size=200))
@settings(max_examples=100)
def test_property_transliteration_preserves_non_doke_text(text):
    """
    Property: For any text without Doke characters, transliteration should not change the text.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Remove any Doke characters that might have been randomly generated
    clean_text = text
    for doke_char in linguist.TRANSLITERATION_MAP.keys():
        clean_text = clean_text.replace(doke_char, '')
    
    # Act
    result, changes = linguist._transliterate(clean_text)
    
    # Assert: Text should be unchanged
    assert result == clean_text, "Text without Doke characters should remain unchanged"
    assert len(changes) == 0, "Should have no changes for text without Doke characters"


@given(text=arbitrary_text_with_doke(min_doke=1, max_doke=10))
@settings(max_examples=100)
def test_property_transliteration_length_bounded(text):
    """
    Property: Transliteration should not drastically change text length.
    
    Since most Doke characters map to 1-2 characters, the result should be
    at most 2x the original length.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert: Result length should be reasonable
    assert len(result) <= len(text) * 2, \
        "Transliterated text should not be more than 2x original length"
    assert len(result) >= len(text) * 0.5, \
        "Transliterated text should not be less than 0.5x original length"


@given(text=arbitrary_text_with_doke(min_doke=1, max_doke=10))
@settings(max_examples=100)
def test_property_transliteration_produces_valid_mappings(text):
    """
    Property: Every Doke character in the original text should have a corresponding
    modern equivalent in the result according to TRANSLITERATION_MAP.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Count Doke characters in original
    doke_chars_in_text = {}
    for doke_char in linguist.TRANSLITERATION_MAP.keys():
        count = text.count(doke_char)
        if count > 0:
            doke_chars_in_text[doke_char] = count
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert: For each Doke character found, verify its replacement appears
    for doke_char, count in doke_chars_in_text.items():
        modern_equiv = linguist.TRANSLITERATION_MAP[doke_char]
        # The modern equivalent should appear at least as many times as the Doke char was replaced
        # (it might appear more if it was already in the text)
        assert modern_equiv in result or count == 0, \
            f"Modern equivalent '{modern_equiv}' for '{doke_char}' should appear in result"


@given(
    text=arbitrary_text_with_doke(min_doke=1, max_doke=5),
    iterations=st.integers(min_value=1, max_value=5)
)
@settings(max_examples=100)
def test_property_transliteration_multiple_applications(text, iterations):
    """
    Property: Applying transliteration multiple times should be equivalent to applying it once.
    
    This is a stronger form of idempotence testing.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Act: Apply transliteration once
    result_once, _ = linguist._transliterate(text)
    
    # Act: Apply transliteration multiple times
    result_multiple = text
    for _ in range(iterations):
        result_multiple, _ = linguist._transliterate(result_multiple)
    
    # Assert: Results should be identical
    assert result_once == result_multiple, \
        f"Applying transliteration {iterations} times should equal applying it once"


# =============================================================================
# EDGE CASE PROPERTY TESTS
# =============================================================================

@given(doke_char=st.sampled_from(['ɓ', 'ɗ', 'ȿ', 'ɀ', 'ŋ', 'ʃ', 'ʒ', 'ṱ', 'ḓ', 'ḽ', 'ṋ']))
@settings(max_examples=100)
def test_property_single_doke_character_transliteration(doke_char):
    """
    Property: Each individual Doke character should be correctly transliterated.
    """
    # Arrange
    linguist = LinguistAgent()
    text = f"test {doke_char} test"
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert
    assert doke_char not in result, f"Doke character '{doke_char}' should be removed"
    assert len(changes) == 1, "Should have exactly one change"
    assert changes[0][0] == doke_char, "Change should be for the correct character"
    
    # Verify the replacement is correct
    expected_modern = linguist.TRANSLITERATION_MAP[doke_char]
    assert expected_modern in result, f"Modern equivalent '{expected_modern}' should be in result"


@given(text=st.just(''))
@settings(max_examples=10)
def test_property_empty_text_transliteration(text):
    """
    Property: Transliterating empty text should return empty text with no changes.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert
    assert result == '', "Empty text should remain empty"
    assert len(changes) == 0, "Should have no changes for empty text"


@given(text=st.text(alphabet=st.sampled_from(['ɓ', 'ɗ', 'ȿ', 'ɀ']), min_size=1, max_size=50))
@settings(max_examples=100)
def test_property_only_doke_characters(text):
    """
    Property: Text containing only Doke characters should be fully transliterated.
    """
    # Arrange
    linguist = LinguistAgent()
    
    # Act
    result, changes = linguist._transliterate(text)
    
    # Assert: No Doke characters should remain
    for doke_char in linguist.TRANSLITERATION_MAP.keys():
        assert doke_char not in result, f"Doke character '{doke_char}' should be removed"
    
    # Assert: Result should not be empty (unless all Doke chars map to empty, which they don't)
    assert len(result) > 0, "Result should not be empty"
