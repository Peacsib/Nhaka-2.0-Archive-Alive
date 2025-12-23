"""
Unit tests for Pydantic data models.
Tests model creation, validation, and field requirements.

Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
"""
import pytest
from datetime import datetime
from typing import List

# Import models from main.py
import sys
sys.path.insert(0, '.')
from main import (
    AgentType, ConfidenceLevel, AgentMessage, TextSegment,
    RepairRecommendation, DamageHotspot, ResurrectionResult
)


# =============================================================================
# AGENTMESSAGE TESTS (Requirement 10.1)
# =============================================================================

@pytest.mark.unit
def test_agent_message_creation_with_all_required_fields():
    """Test AgentMessage creation with all required fields."""
    msg = AgentMessage(
        agent=AgentType.SCANNER,
        message="Test message",
        confidence=85.5,
        document_section="Test Section",
        is_debate=False,
        timestamp=datetime(2024, 1, 15, 10, 30, 0),
        metadata={"key": "value"}
    )
    
    assert msg.agent == AgentType.SCANNER
    assert msg.message == "Test message"
    assert msg.confidence == 85.5
    assert msg.document_section == "Test Section"
    assert msg.is_debate is False
    assert msg.timestamp == datetime(2024, 1, 15, 10, 30, 0)
    assert msg.metadata == {"key": "value"}


@pytest.mark.unit
def test_agent_message_minimal_fields():
    """Test AgentMessage with only required fields (agent and message)."""
    msg = AgentMessage(
        agent=AgentType.LINGUIST,
        message="Minimal message"
    )
    
    assert msg.agent == AgentType.LINGUIST
    assert msg.message == "Minimal message"
    assert msg.confidence is None
    assert msg.document_section is None
    assert msg.is_debate is False
    assert msg.timestamp is not None  # Auto-generated
    assert msg.metadata is None


@pytest.mark.unit
def test_agent_message_all_agent_types():
    """Test AgentMessage with all agent types."""
    agent_types = [
        AgentType.SCANNER,
        AgentType.LINGUIST,
        AgentType.HISTORIAN,
        AgentType.VALIDATOR,
        AgentType.REPAIR_ADVISOR
    ]
    
    for agent_type in agent_types:
        msg = AgentMessage(agent=agent_type, message=f"Message from {agent_type.value}")
        assert msg.agent == agent_type


# =============================================================================
# TEXTSEGMENT TESTS (Requirement 10.2)
# =============================================================================

@pytest.mark.unit
def test_text_segment_creation_with_text_and_confidence():
    """Test TextSegment creation with text and confidence."""
    segment = TextSegment(
        text="Sample text content",
        confidence=ConfidenceLevel.HIGH
    )
    
    assert segment.text == "Sample text content"
    assert segment.confidence == ConfidenceLevel.HIGH
    assert segment.original_text is None
    assert segment.corrections is None


@pytest.mark.unit
def test_text_segment_with_all_fields():
    """Test TextSegment with all fields populated."""
    segment = TextSegment(
        text="Modern text",
        confidence=ConfidenceLevel.MEDIUM,
        original_text="Original text with ɓ",
        corrections=["ɓ→b transliteration", "Fixed spelling"]
    )
    
    assert segment.text == "Modern text"
    assert segment.confidence == ConfidenceLevel.MEDIUM
    assert segment.original_text == "Original text with ɓ"
    assert segment.corrections == ["ɓ→b transliteration", "Fixed spelling"]


@pytest.mark.unit
def test_text_segment_all_confidence_levels():
    """Test TextSegment with all confidence levels."""
    confidence_levels = [
        ConfidenceLevel.HIGH,
        ConfidenceLevel.MEDIUM,
        ConfidenceLevel.LOW
    ]
    
    for level in confidence_levels:
        segment = TextSegment(text="Test", confidence=level)
        assert segment.confidence == level


# =============================================================================
# REPAIRRECOMMENDATION TESTS (Requirement 10.3)
# =============================================================================

@pytest.mark.unit
def test_repair_recommendation_creation():
    """Test RepairRecommendation creation with issue, severity, recommendation."""
    rec = RepairRecommendation(
        issue="Iron-gall ink corrosion",
        severity="critical",
        recommendation="Calcium phytate treatment"
    )
    
    assert rec.issue == "Iron-gall ink corrosion"
    assert rec.severity == "critical"
    assert rec.recommendation == "Calcium phytate treatment"
    assert rec.estimated_cost is None


@pytest.mark.unit
def test_repair_recommendation_with_all_fields():
    """Test RepairRecommendation with all fields including estimated_cost."""
    rec = RepairRecommendation(
        issue="Foxing damage",
        severity="moderate",
        recommendation="Aqueous deacidification",
        estimated_cost="$100-300 per document"
    )
    
    assert rec.issue == "Foxing damage"
    assert rec.severity == "moderate"
    assert rec.recommendation == "Aqueous deacidification"
    assert rec.estimated_cost == "$100-300 per document"


@pytest.mark.unit
def test_repair_recommendation_all_severity_levels():
    """Test RepairRecommendation with all severity levels."""
    severities = ["critical", "moderate", "minor"]
    
    for severity in severities:
        rec = RepairRecommendation(
            issue=f"{severity} issue",
            severity=severity,
            recommendation=f"Treatment for {severity}"
        )
        assert rec.severity == severity


# =============================================================================
# DAMAGEHOTSPOT TESTS (Requirement 10.4)
# =============================================================================

@pytest.mark.unit
def test_damage_hotspot_creation_with_all_required_fields():
    """Test DamageHotspot creation with all required fields."""
    hotspot = DamageHotspot(
        id=1,
        x=25.5,
        y=35.0,
        damage_type="iron_gall_ink",
        severity="critical",
        label="Iron-gall ink corrosion",
        treatment="Calcium phytate treatment",
        icon="🔍"
    )
    
    assert hotspot.id == 1
    assert hotspot.x == 25.5
    assert hotspot.y == 35.0
    assert hotspot.damage_type == "iron_gall_ink"
    assert hotspot.severity == "critical"
    assert hotspot.label == "Iron-gall ink corrosion"
    assert hotspot.treatment == "Calcium phytate treatment"
    assert hotspot.icon == "🔍"


@pytest.mark.unit
def test_damage_hotspot_coordinate_boundaries():
    """Test DamageHotspot with boundary coordinates (0-100)."""
    # Test corners
    corners = [
        (0.0, 0.0),      # Top-left
        (100.0, 0.0),    # Top-right
        (0.0, 100.0),    # Bottom-left
        (100.0, 100.0),  # Bottom-right
    ]
    
    for i, (x, y) in enumerate(corners):
        hotspot = DamageHotspot(
            id=i,
            x=x,
            y=y,
            damage_type="test",
            severity="minor",
            label="Test",
            treatment="Test",
            icon="⚠️"
        )
        assert hotspot.x == x
        assert hotspot.y == y


@pytest.mark.unit
def test_damage_hotspot_different_damage_types():
    """Test DamageHotspot with various damage types."""
    damage_types = [
        "iron_gall_ink",
        "foxing",
        "tears",
        "fading",
        "water_damage"
    ]
    
    for i, damage_type in enumerate(damage_types):
        hotspot = DamageHotspot(
            id=i,
            x=50.0,
            y=50.0,
            damage_type=damage_type,
            severity="moderate",
            label=f"{damage_type} damage",
            treatment=f"Treatment for {damage_type}",
            icon="⚠️"
        )
        assert hotspot.damage_type == damage_type


# =============================================================================
# RESURRECTIONRESULT TESTS (Requirement 10.5)
# =============================================================================

@pytest.mark.unit
def test_resurrection_result_creation_with_all_required_fields():
    """Test ResurrectionResult creation with all required fields."""
    segments = [
        TextSegment(text="Test text", confidence=ConfidenceLevel.HIGH)
    ]
    messages = [
        AgentMessage(agent=AgentType.SCANNER, message="Test message")
    ]
    
    result = ResurrectionResult(
        segments=segments,
        overall_confidence=78.5,
        agent_messages=messages,
        processing_time_ms=5000
    )
    
    assert result.segments == segments
    assert result.overall_confidence == 78.5
    assert result.agent_messages == messages
    assert result.processing_time_ms == 5000
    assert result.raw_ocr_text is None
    assert result.transliterated_text is None
    assert result.historian_analysis is None
    assert result.validator_corrections is None
    assert result.repair_recommendations is None
    assert result.damage_hotspots is None
    assert result.archive_id is None


@pytest.mark.unit
def test_resurrection_result_with_all_fields():
    """Test ResurrectionResult with all fields populated."""
    segments = [
        TextSegment(text="Modern text", confidence=ConfidenceLevel.HIGH)
    ]
    messages = [
        AgentMessage(agent=AgentType.SCANNER, message="Scanner message"),
        AgentMessage(agent=AgentType.LINGUIST, message="Linguist message")
    ]
    recommendations = [
        RepairRecommendation(
            issue="Damage",
            severity="critical",
            recommendation="Fix it"
        )
    ]
    hotspots = [
        DamageHotspot(
            id=1,
            x=25.0,
            y=35.0,
            damage_type="foxing",
            severity="moderate",
            label="Foxing",
            treatment="Treatment",
            icon="🟤"
        )
    ]
    
    result = ResurrectionResult(
        segments=segments,
        overall_confidence=85.0,
        agent_messages=messages,
        processing_time_ms=10000,
        raw_ocr_text="Raw OCR text",
        transliterated_text="Transliterated text",
        historian_analysis="Historical analysis",
        validator_corrections=["Correction 1", "Correction 2"],
        repair_recommendations=recommendations,
        damage_hotspots=hotspots,
        archive_id="archive-123"
    )
    
    assert len(result.segments) == 1
    assert result.overall_confidence == 85.0
    assert len(result.agent_messages) == 2
    assert result.processing_time_ms == 10000
    assert result.raw_ocr_text == "Raw OCR text"
    assert result.transliterated_text == "Transliterated text"
    assert result.historian_analysis == "Historical analysis"
    assert result.validator_corrections == ["Correction 1", "Correction 2"]
    assert len(result.repair_recommendations) == 1
    assert len(result.damage_hotspots) == 1
    assert result.archive_id == "archive-123"


@pytest.mark.unit
def test_resurrection_result_with_multiple_segments():
    """Test ResurrectionResult with multiple text segments."""
    segments = [
        TextSegment(text="Segment 1", confidence=ConfidenceLevel.HIGH),
        TextSegment(text="Segment 2", confidence=ConfidenceLevel.MEDIUM),
        TextSegment(text="Segment 3", confidence=ConfidenceLevel.LOW)
    ]
    messages = [
        AgentMessage(agent=AgentType.SCANNER, message="Test")
    ]
    
    result = ResurrectionResult(
        segments=segments,
        overall_confidence=70.0,
        agent_messages=messages,
        processing_time_ms=3000
    )
    
    assert len(result.segments) == 3
    assert result.segments[0].confidence == ConfidenceLevel.HIGH
    assert result.segments[1].confidence == ConfidenceLevel.MEDIUM
    assert result.segments[2].confidence == ConfidenceLevel.LOW


@pytest.mark.unit
def test_resurrection_result_with_multiple_agent_messages():
    """Test ResurrectionResult with messages from all agents."""
    segments = [TextSegment(text="Test", confidence=ConfidenceLevel.HIGH)]
    messages = [
        AgentMessage(agent=AgentType.SCANNER, message="Scanner done"),
        AgentMessage(agent=AgentType.LINGUIST, message="Linguist done"),
        AgentMessage(agent=AgentType.HISTORIAN, message="Historian done"),
        AgentMessage(agent=AgentType.VALIDATOR, message="Validator done"),
        AgentMessage(agent=AgentType.REPAIR_ADVISOR, message="Repair done")
    ]
    
    result = ResurrectionResult(
        segments=segments,
        overall_confidence=80.0,
        agent_messages=messages,
        processing_time_ms=15000
    )
    
    assert len(result.agent_messages) == 5
    assert result.agent_messages[0].agent == AgentType.SCANNER
    assert result.agent_messages[1].agent == AgentType.LINGUIST
    assert result.agent_messages[2].agent == AgentType.HISTORIAN
    assert result.agent_messages[3].agent == AgentType.VALIDATOR
    assert result.agent_messages[4].agent == AgentType.REPAIR_ADVISOR
