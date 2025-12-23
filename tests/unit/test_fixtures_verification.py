"""
Verification test for fixtures and generators.
Ensures all fixtures and generators are working correctly.
"""
import pytest
from datetime import datetime

# Import fixtures
from tests.fixtures import (
    sample_scanner_message,
    sample_agent_messages,
    sample_text_segment_high,
    sample_repair_recommendation_critical,
    sample_damage_hotspot,
    sample_context_complete,
    sample_resurrection_result,
    SAMPLE_DOKE_TEXT,
    SAMPLE_MODERN_TEXT,
)

# Import generators
from tests.generators import (
    arbitrary_text,
    arbitrary_confidence,
    arbitrary_coordinates,
    arbitrary_agent_message,
    arbitrary_text_segment,
    arbitrary_damage_hotspot,
    arbitrary_resurrection_result,
)

from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st


@pytest.mark.unit
def test_sample_doke_text_contains_doke_characters():
    """Verify sample Doke text contains Doke characters."""
    doke_chars = ['ɓ', 'ɗ', 'ȿ', 'ɀ', 'ŋ', 'ʃ', 'ʒ', 'ṱ', 'ḓ', 'ḽ', 'ṋ']
    assert any(char in SAMPLE_DOKE_TEXT for char in doke_chars), \
        "Sample Doke text should contain at least one Doke character"


@pytest.mark.unit
def test_sample_modern_text_no_doke_characters():
    """Verify sample modern text has no Doke characters."""
    doke_chars = ['ɓ', 'ɗ', 'ȿ', 'ɀ', 'ŋ', 'ʃ', 'ʒ', 'ṱ', 'ḓ', 'ḽ', 'ṋ']
    assert not any(char in SAMPLE_MODERN_TEXT for char in doke_chars), \
        "Sample modern text should not contain Doke characters"


@pytest.mark.unit
def test_scanner_message_fixture(sample_scanner_message):
    """Verify scanner message fixture is valid."""
    assert sample_scanner_message.agent.value == "scanner"
    assert len(sample_scanner_message.message) > 0
    assert sample_scanner_message.confidence is not None
    assert 0 <= sample_scanner_message.confidence <= 100
    assert isinstance(sample_scanner_message.timestamp, datetime)


@pytest.mark.unit
def test_agent_messages_fixture(sample_agent_messages):
    """Verify agent messages fixture contains all agents."""
    assert len(sample_agent_messages) == 10
    agents = {msg.agent.value for msg in sample_agent_messages}
    expected_agents = {'scanner', 'linguist', 'historian', 'validator', 'repair_advisor'}
    assert agents == expected_agents


@pytest.mark.unit
def test_text_segment_fixture(sample_text_segment_high):
    """Verify text segment fixture is valid."""
    assert len(sample_text_segment_high.text) > 0
    assert sample_text_segment_high.confidence.value == "high"
    assert sample_text_segment_high.original_text is not None


@pytest.mark.unit
def test_repair_recommendation_fixture(sample_repair_recommendation_critical):
    """Verify repair recommendation fixture is valid."""
    assert sample_repair_recommendation_critical.severity == "critical"
    assert len(sample_repair_recommendation_critical.issue) > 0
    assert len(sample_repair_recommendation_critical.recommendation) > 0


@pytest.mark.unit
def test_damage_hotspot_fixture(sample_damage_hotspot):
    """Verify damage hotspot fixture is valid."""
    assert sample_damage_hotspot.id > 0
    assert 0 <= sample_damage_hotspot.x <= 100
    assert 0 <= sample_damage_hotspot.y <= 100
    assert sample_damage_hotspot.severity in ['critical', 'moderate', 'minor']


@pytest.mark.unit
def test_context_complete_fixture(sample_context_complete):
    """Verify complete context fixture has all required fields."""
    required_fields = [
        'raw_text', 'ocr_confidence', 'transliterated_text',
        'verified_facts', 'final_confidence', 'repair_recommendations',
        'damage_hotspots'
    ]
    for field in required_fields:
        assert field in sample_context_complete, f"Missing field: {field}"


@pytest.mark.unit
def test_resurrection_result_fixture(sample_resurrection_result):
    """Verify resurrection result fixture is valid."""
    assert len(sample_resurrection_result.segments) > 0
    assert 0 <= sample_resurrection_result.overall_confidence <= 100
    assert len(sample_resurrection_result.agent_messages) > 0
    assert sample_resurrection_result.processing_time_ms > 0


# =============================================================================
# GENERATOR TESTS
# =============================================================================

@pytest.mark.property
@given(text=arbitrary_text())
@settings(max_examples=10, suppress_health_check=[HealthCheck.too_slow])
def test_arbitrary_text_generator(text):
    """Verify arbitrary_text generator produces valid text."""
    assert isinstance(text, str)
    # Text can be empty or have content
    assert len(text) >= 0


@pytest.mark.property
@given(confidence=arbitrary_confidence())
@settings(max_examples=10)
def test_arbitrary_confidence_generator(confidence):
    """Verify arbitrary_confidence generator produces valid confidence scores."""
    assert isinstance(confidence, float)
    assert 0 <= confidence <= 100
    assert not (confidence != confidence)  # Not NaN


@pytest.mark.property
@given(coords=arbitrary_coordinates())
@settings(max_examples=10)
def test_arbitrary_coordinates_generator(coords):
    """Verify arbitrary_coordinates generator produces valid coordinates."""
    x, y = coords
    assert isinstance(x, float)
    assert isinstance(y, float)
    assert 0 <= x <= 100
    assert 0 <= y <= 100


@pytest.mark.property
@given(message=arbitrary_agent_message())
@settings(max_examples=10)
def test_arbitrary_agent_message_generator(message):
    """Verify arbitrary_agent_message generator produces valid messages."""
    assert message.agent.value in ['scanner', 'linguist', 'historian', 'validator', 'repair_advisor']
    assert len(message.message) >= 10
    assert isinstance(message.timestamp, datetime)
    if message.confidence is not None:
        assert 0 <= message.confidence <= 100


@pytest.mark.property
@given(segment=arbitrary_text_segment())
@settings(max_examples=10)
def test_arbitrary_text_segment_generator(segment):
    """Verify arbitrary_text_segment generator produces valid segments."""
    assert len(segment.text) >= 10
    assert segment.confidence.value in ['high', 'medium', 'low']


@pytest.mark.property
@given(hotspot=arbitrary_damage_hotspot())
@settings(max_examples=10)
def test_arbitrary_damage_hotspot_generator(hotspot):
    """Verify arbitrary_damage_hotspot generator produces valid hotspots."""
    assert hotspot.id > 0
    assert 0 <= hotspot.x <= 100
    assert 0 <= hotspot.y <= 100
    assert hotspot.severity in ['critical', 'moderate', 'minor']
    assert len(hotspot.label) >= 10


@pytest.mark.property
@given(result=arbitrary_resurrection_result())
@settings(max_examples=10)
def test_arbitrary_resurrection_result_generator(result):
    """Verify arbitrary_resurrection_result generator produces valid results."""
    assert len(result.segments) >= 1
    assert 0 <= result.overall_confidence <= 100
    assert len(result.agent_messages) >= 5
    assert 100 <= result.processing_time_ms <= 60000


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
