"""
Hypothesis generators for property-based testing.
Generates random test data for comprehensive testing coverage.

Requirements: All property-based test requirements
"""
from datetime import datetime, timedelta
import random
from typing import Optional
from hypothesis import strategies as st
from hypothesis.strategies import composite

# Import models from main.py
import sys
sys.path.insert(0, '.')
from main import (
    AgentType, ConfidenceLevel, AgentMessage, TextSegment,
    RepairRecommendation, DamageHotspot, ResurrectionResult
)


# =============================================================================
# BASIC GENERATORS
# =============================================================================

# Doke orthography characters used in Pre-1955 Shona
DOKE_CHARACTERS = ['ɓ', 'ɗ', 'ȿ', 'ɀ', 'ŋ', 'ʃ', 'ʒ', 'ṱ', 'ḓ', 'ḽ', 'ṋ']

# Common Shona words for realistic text generation
SHONA_WORDS = [
    'Kuna', 'VaRungu', 'Ini', 'Mambo', 'Lobengula', 'Rudd', 'Jameson',
    'ndinonyora', 'tsamba', 'chibvumirano', 'Ndakasaina', 'Zvakasainwa',
    'Ndatenda', 'Matabele', 'Mashona', 'kraal', 'induna', 'musha'
]

# Historical figures for context
HISTORICAL_FIGURES = [
    'Lobengula', 'Rudd', 'Rhodes', 'Jameson', 'Colquhoun',
    'Maguire', 'Thompson'
]


@st.composite
def arbitrary_text(draw, min_length: int = 10, max_length: int = 500,
                   include_doke: bool = True) -> str:
    """
    Generate random text with optional Doke characters.
    
    Args:
        min_length: Minimum text length
        max_length: Maximum text length
        include_doke: Whether to include Doke orthography characters
    
    Returns:
        Random text string
    """
    # Choose between different text generation strategies
    strategy = draw(st.integers(min_value=0, max_value=2))
    
    if strategy == 0:
        # Pure random text
        text = draw(st.text(min_size=min_length, max_size=max_length))
    elif strategy == 1:
        # Shona-like text with words
        num_words = draw(st.integers(min_value=3, max_value=20))
        words = draw(st.lists(
            st.sampled_from(SHONA_WORDS),
            min_size=num_words,
            max_size=num_words
        ))
        text = ' '.join(words)
    else:
        # Mixed text with punctuation
        text = draw(st.text(
            alphabet=st.characters(
                whitelist_categories=('Lu', 'Ll', 'Nd', 'Po', 'Zs'),
                min_codepoint=32,
                max_codepoint=126
            ),
            min_size=min_length,
            max_size=max_length
        ))
    
    # Optionally inject Doke characters
    if include_doke and text and draw(st.booleans()):
        # Replace some random characters with Doke characters
        num_replacements = draw(st.integers(min_value=1, max_value=min(5, len(text) // 10)))
        text_list = list(text)
        for _ in range(num_replacements):
            if text_list:
                pos = draw(st.integers(min_value=0, max_value=len(text_list) - 1))
                doke_char = draw(st.sampled_from(DOKE_CHARACTERS))
                text_list[pos] = doke_char
        text = ''.join(text_list)
    
    return text


@st.composite
def arbitrary_confidence(draw) -> float:
    """
    Generate random confidence score between 0 and 100.
    
    Returns:
        Float between 0.0 and 100.0
    """
    return draw(st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False))


@st.composite
def arbitrary_coordinates(draw) -> tuple:
    """
    Generate random x/y coordinates for damage hotspots (0-100 percentage).
    
    Returns:
        Tuple of (x, y) floats between 0.0 and 100.0
    """
    x = draw(st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False))
    y = draw(st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False))
    return (x, y)


@st.composite
def arbitrary_image_bytes(draw, min_size: int = 100, max_size: int = 10000) -> bytes:
    """
    Generate random image data bytes.
    
    Args:
        min_size: Minimum byte size
        max_size: Maximum byte size
    
    Returns:
        Random bytes representing image data
    """
    size = draw(st.integers(min_value=min_size, max_value=max_size))
    return draw(st.binary(min_size=size, max_size=size))


# =============================================================================
# ENUM GENERATORS
# =============================================================================

def arbitrary_agent_type() -> st.SearchStrategy[AgentType]:
    """Generate random AgentType enum value."""
    return st.sampled_from([
        AgentType.SCANNER,
        AgentType.LINGUIST,
        AgentType.HISTORIAN,
        AgentType.VALIDATOR,
        AgentType.REPAIR_ADVISOR
    ])


def arbitrary_confidence_level() -> st.SearchStrategy[ConfidenceLevel]:
    """Generate random ConfidenceLevel enum value."""
    return st.sampled_from([
        ConfidenceLevel.HIGH,
        ConfidenceLevel.MEDIUM,
        ConfidenceLevel.LOW
    ])


def arbitrary_severity() -> st.SearchStrategy[str]:
    """Generate random severity level."""
    return st.sampled_from(['critical', 'moderate', 'minor'])


def arbitrary_damage_type() -> st.SearchStrategy[str]:
    """Generate random damage type."""
    return st.sampled_from([
        'iron_gall_ink', 'foxing', 'tears', 'fading',
        'water_damage', 'brittleness', 'yellowing'
    ])


# =============================================================================
# MODEL GENERATORS
# =============================================================================

@st.composite
def arbitrary_agent_message(draw) -> AgentMessage:
    """
    Generate random valid AgentMessage instance.
    
    Returns:
        Random AgentMessage with all fields populated
    """
    agent = draw(arbitrary_agent_type())
    message = draw(st.text(min_size=10, max_size=200))
    confidence = draw(st.one_of(st.none(), arbitrary_confidence()))
    document_section = draw(st.one_of(
        st.none(),
        st.sampled_from([
            'Text Extraction', 'Transliteration', 'Figure Detection',
            'Date Verification', 'Confidence Warning', 'Damage Assessment'
        ])
    ))
    is_debate = draw(st.booleans())
    
    # Generate timestamp within last 30 days
    days_ago = draw(st.integers(min_value=0, max_value=30))
    timestamp = datetime.utcnow() - timedelta(days=days_ago)
    
    # Optional metadata
    metadata = None
    if draw(st.booleans()):
        metadata = draw(st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(
                st.integers(),
                st.floats(allow_nan=False, allow_infinity=False),
                st.text(max_size=50),
                st.booleans()
            ),
            max_size=5
        ))
    
    return AgentMessage(
        agent=agent,
        message=message,
        confidence=confidence,
        document_section=document_section,
        is_debate=is_debate,
        timestamp=timestamp,
        metadata=metadata
    )


@st.composite
def arbitrary_text_segment(draw) -> TextSegment:
    """
    Generate random valid TextSegment instance.
    
    Returns:
        Random TextSegment with all fields populated
    """
    text = draw(arbitrary_text(min_length=10, max_length=300))
    confidence = draw(arbitrary_confidence_level())
    
    # Optional original text (might be different if transliterated)
    original_text = None
    if draw(st.booleans()):
        original_text = draw(arbitrary_text(min_length=10, max_length=300, include_doke=True))
    
    # Optional corrections list
    corrections = None
    if draw(st.booleans()):
        num_corrections = draw(st.integers(min_value=1, max_value=5))
        corrections = draw(st.lists(
            st.text(min_size=10, max_size=100),
            min_size=num_corrections,
            max_size=num_corrections
        ))
    
    return TextSegment(
        text=text,
        confidence=confidence,
        original_text=original_text,
        corrections=corrections
    )


@st.composite
def arbitrary_repair_recommendation(draw) -> RepairRecommendation:
    """
    Generate random valid RepairRecommendation instance.
    
    Returns:
        Random RepairRecommendation with all fields populated
    """
    issue = draw(st.text(min_size=10, max_size=100))
    severity = draw(arbitrary_severity())
    recommendation = draw(st.text(min_size=20, max_size=200))
    
    # Optional estimated cost
    estimated_cost = None
    if draw(st.booleans()):
        min_cost = draw(st.integers(min_value=50, max_value=500))
        max_cost = draw(st.integers(min_value=min_cost, max_value=min_cost + 500))
        estimated_cost = f"${min_cost}-{max_cost} per document"
    
    return RepairRecommendation(
        issue=issue,
        severity=severity,
        recommendation=recommendation,
        estimated_cost=estimated_cost
    )


@st.composite
def arbitrary_damage_hotspot(draw) -> DamageHotspot:
    """
    Generate random valid DamageHotspot instance.
    
    Returns:
        Random DamageHotspot with all fields populated
    """
    id = draw(st.integers(min_value=1, max_value=100))
    x, y = draw(arbitrary_coordinates())
    damage_type = draw(arbitrary_damage_type())
    severity = draw(arbitrary_severity())
    label = draw(st.text(min_size=10, max_size=100))
    treatment = draw(st.text(min_size=20, max_size=200))
    icon = draw(st.sampled_from(['🔍', '🟤', '📄', '☀️', '💧', '⚡', '⚠️']))
    
    return DamageHotspot(
        id=id,
        x=x,
        y=y,
        damage_type=damage_type,
        severity=severity,
        label=label,
        treatment=treatment,
        icon=icon
    )


@st.composite
def arbitrary_resurrection_result(draw) -> ResurrectionResult:
    """
    Generate random valid ResurrectionResult instance.
    
    Returns:
        Random ResurrectionResult with all fields populated
    """
    # Generate segments (1-5 segments)
    num_segments = draw(st.integers(min_value=1, max_value=5))
    segments = draw(st.lists(
        arbitrary_text_segment(),
        min_size=num_segments,
        max_size=num_segments
    ))
    
    # Overall confidence
    overall_confidence = draw(arbitrary_confidence())
    
    # Agent messages (5-15 messages)
    num_messages = draw(st.integers(min_value=5, max_value=15))
    agent_messages = draw(st.lists(
        arbitrary_agent_message(),
        min_size=num_messages,
        max_size=num_messages
    ))
    
    # Processing time (100ms to 60s)
    processing_time_ms = draw(st.integers(min_value=100, max_value=60000))
    
    # Optional fields
    raw_ocr_text = draw(st.one_of(st.none(), arbitrary_text()))
    transliterated_text = draw(st.one_of(st.none(), arbitrary_text()))
    historian_analysis = draw(st.one_of(st.none(), st.text(max_size=500)))
    
    validator_corrections = None
    if draw(st.booleans()):
        num_corrections = draw(st.integers(min_value=0, max_value=5))
        validator_corrections = draw(st.lists(
            st.text(min_size=10, max_size=100),
            min_size=num_corrections,
            max_size=num_corrections
        ))
    
    repair_recommendations = None
    if draw(st.booleans()):
        num_recs = draw(st.integers(min_value=1, max_value=5))
        repair_recommendations = draw(st.lists(
            arbitrary_repair_recommendation(),
            min_size=num_recs,
            max_size=num_recs
        ))
    
    damage_hotspots = None
    if draw(st.booleans()):
        num_hotspots = draw(st.integers(min_value=1, max_value=6))
        damage_hotspots = draw(st.lists(
            arbitrary_damage_hotspot(),
            min_size=num_hotspots,
            max_size=num_hotspots
        ))
    
    archive_id = draw(st.one_of(
        st.none(),
        st.text(min_size=10, max_size=50)
    ))
    
    return ResurrectionResult(
        segments=segments,
        overall_confidence=overall_confidence,
        agent_messages=agent_messages,
        processing_time_ms=processing_time_ms,
        raw_ocr_text=raw_ocr_text,
        transliterated_text=transliterated_text,
        historian_analysis=historian_analysis,
        validator_corrections=validator_corrections,
        repair_recommendations=repair_recommendations,
        damage_hotspots=damage_hotspots,
        archive_id=archive_id
    )


# =============================================================================
# SPECIALIZED GENERATORS
# =============================================================================

@st.composite
def arbitrary_text_with_doke(draw, min_doke: int = 1, max_doke: int = 10) -> str:
    """
    Generate text guaranteed to contain Doke characters.
    
    Args:
        min_doke: Minimum number of Doke characters
        max_doke: Maximum number of Doke characters
    
    Returns:
        Text string containing Doke characters
    """
    # Start with base text
    base_text = draw(arbitrary_text(min_length=50, max_length=300, include_doke=False))
    
    # Inject guaranteed Doke characters
    num_doke = draw(st.integers(min_value=min_doke, max_value=max_doke))
    text_list = list(base_text) if base_text else ['a'] * 50
    
    for _ in range(num_doke):
        if text_list:
            pos = draw(st.integers(min_value=0, max_value=len(text_list) - 1))
            doke_char = draw(st.sampled_from(DOKE_CHARACTERS))
            text_list[pos] = doke_char
    
    return ''.join(text_list)


@st.composite
def arbitrary_text_with_historical_figures(draw) -> str:
    """
    Generate text guaranteed to contain historical figures.
    
    Returns:
        Text string containing historical figure names
    """
    # Pick 1-3 historical figures
    num_figures = draw(st.integers(min_value=1, max_value=3))
    figures = draw(st.lists(
        st.sampled_from(HISTORICAL_FIGURES),
        min_size=num_figures,
        max_size=num_figures,
        unique=True
    ))
    
    # Build text with figures
    words = draw(st.lists(st.sampled_from(SHONA_WORDS), min_size=10, max_size=20))
    
    # Insert figures at random positions
    for figure in figures:
        pos = draw(st.integers(min_value=0, max_value=len(words)))
        words.insert(pos, figure)
    
    return ' '.join(words)


@st.composite
def arbitrary_text_with_dates(draw) -> str:
    """
    Generate text guaranteed to contain dates (1880-1929).
    
    Returns:
        Text string containing historical dates
    """
    # Generate base text
    words = draw(st.lists(st.sampled_from(SHONA_WORDS), min_size=10, max_size=20))
    
    # Insert 1-3 dates
    num_dates = draw(st.integers(min_value=1, max_value=3))
    for _ in range(num_dates):
        year = draw(st.integers(min_value=1880, max_value=1929))
        pos = draw(st.integers(min_value=0, max_value=len(words)))
        words.insert(pos, str(year))
    
    return ' '.join(words)


@st.composite
def arbitrary_context_dict(draw) -> dict:
    """
    Generate random context dictionary for agent processing.
    
    Returns:
        Dictionary with random context fields
    """
    context = {
        "image_data": draw(arbitrary_image_bytes()),
        "start_time": datetime.utcnow() - timedelta(seconds=draw(st.integers(min_value=0, max_value=60)))
    }
    
    # Optionally add fields from different agents
    if draw(st.booleans()):
        context["raw_text"] = draw(arbitrary_text())
        context["ocr_confidence"] = draw(arbitrary_confidence())
    
    if draw(st.booleans()):
        context["transliterated_text"] = draw(arbitrary_text())
        context["linguistic_changes"] = []
    
    if draw(st.booleans()):
        context["verified_facts"] = draw(st.lists(st.text(max_size=100), max_size=5))
        context["historical_anomalies"] = draw(st.lists(st.text(max_size=100), max_size=3))
    
    if draw(st.booleans()):
        context["final_confidence"] = draw(arbitrary_confidence())
        context["validator_warnings"] = draw(st.lists(st.text(max_size=100), max_size=5))
    
    return context


# =============================================================================
# EDGE CASE GENERATORS
# =============================================================================

def arbitrary_empty_text() -> st.SearchStrategy[str]:
    """Generate empty or whitespace-only text."""
    return st.one_of(
        st.just(''),
        st.text(alphabet=' \t\n\r', min_size=1, max_size=20)
    )


def arbitrary_extreme_confidence() -> st.SearchStrategy[float]:
    """Generate edge case confidence values (0, 100, or near boundaries)."""
    return st.sampled_from([0.0, 0.1, 99.9, 100.0])


def arbitrary_extreme_coordinates() -> st.SearchStrategy[tuple]:
    """Generate edge case coordinates (boundaries and corners)."""
    return st.sampled_from([
        (0.0, 0.0),      # Top-left corner
        (100.0, 0.0),    # Top-right corner
        (0.0, 100.0),    # Bottom-left corner
        (100.0, 100.0),  # Bottom-right corner
        (50.0, 50.0),    # Center
        (0.0, 50.0),     # Left edge
        (100.0, 50.0),   # Right edge
        (50.0, 0.0),     # Top edge
        (50.0, 100.0),   # Bottom edge
    ])
