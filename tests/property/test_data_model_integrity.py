"""
Property-based tests for data model integrity.
Tests that all Pydantic models maintain integrity across randomized inputs.

Feature: code-quality-validation, Property 4: Data Model Integrity
Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
"""
import pytest
from hypothesis import given, settings
from pydantic import ValidationError

# Import models and generators
import sys
sys.path.insert(0, '.')
from main import (
    AgentType, ConfidenceLevel, AgentMessage, TextSegment,
    RepairRecommendation, DamageHotspot, ResurrectionResult
)
from tests.generators import (
    arbitrary_agent_message,
    arbitrary_text_segment,
    arbitrary_repair_recommendation,
    arbitrary_damage_hotspot,
    arbitrary_resurrection_result
)


# =============================================================================
# PROPERTY 4: DATA MODEL INTEGRITY
# =============================================================================

@pytest.mark.property
@given(msg=arbitrary_agent_message())
@settings(max_examples=100, deadline=None)
def test_property_agent_message_integrity(msg: AgentMessage):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.1
    
    For any AgentMessage instance, all required fields should be present
    and have valid types.
    """
    # Verify required fields are present
    assert msg.agent is not None
    assert isinstance(msg.agent, AgentType)
    
    assert msg.message is not None
    assert isinstance(msg.message, str)
    
    # Verify optional fields have correct types when present
    if msg.confidence is not None:
        assert isinstance(msg.confidence, (int, float))
    
    if msg.document_section is not None:
        assert isinstance(msg.document_section, str)
    
    assert isinstance(msg.is_debate, bool)
    
    assert msg.timestamp is not None
    
    if msg.metadata is not None:
        assert isinstance(msg.metadata, dict)
    
    # Verify the model can be serialized and deserialized
    json_data = msg.model_dump()
    assert isinstance(json_data, dict)
    
    # Verify model can be reconstructed from dict
    reconstructed = AgentMessage(**json_data)
    assert reconstructed.agent == msg.agent
    assert reconstructed.message == msg.message


@pytest.mark.property
@given(segment=arbitrary_text_segment())
@settings(max_examples=100)
def test_property_text_segment_integrity(segment: TextSegment):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.2
    
    For any TextSegment instance, all required fields should be present
    and have valid types.
    """
    # Verify required fields are present
    assert segment.text is not None
    assert isinstance(segment.text, str)
    
    assert segment.confidence is not None
    assert isinstance(segment.confidence, ConfidenceLevel)
    
    # Verify optional fields have correct types when present
    if segment.original_text is not None:
        assert isinstance(segment.original_text, str)
    
    if segment.corrections is not None:
        assert isinstance(segment.corrections, list)
        for correction in segment.corrections:
            assert isinstance(correction, str)
    
    # Verify the model can be serialized and deserialized
    json_data = segment.model_dump()
    assert isinstance(json_data, dict)
    
    # Verify model can be reconstructed from dict
    reconstructed = TextSegment(**json_data)
    assert reconstructed.text == segment.text
    assert reconstructed.confidence == segment.confidence


@pytest.mark.property
@given(rec=arbitrary_repair_recommendation())
@settings(max_examples=100)
def test_property_repair_recommendation_integrity(rec: RepairRecommendation):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.3
    
    For any RepairRecommendation instance, all required fields should be
    present and have valid types.
    """
    # Verify required fields are present
    assert rec.issue is not None
    assert isinstance(rec.issue, str)
    
    assert rec.severity is not None
    assert isinstance(rec.severity, str)
    
    assert rec.recommendation is not None
    assert isinstance(rec.recommendation, str)
    
    # Verify optional fields have correct types when present
    if rec.estimated_cost is not None:
        assert isinstance(rec.estimated_cost, str)
    
    # Verify the model can be serialized and deserialized
    json_data = rec.model_dump()
    assert isinstance(json_data, dict)
    
    # Verify model can be reconstructed from dict
    reconstructed = RepairRecommendation(**json_data)
    assert reconstructed.issue == rec.issue
    assert reconstructed.severity == rec.severity
    assert reconstructed.recommendation == rec.recommendation


@pytest.mark.property
@given(hotspot=arbitrary_damage_hotspot())
@settings(max_examples=100)
def test_property_damage_hotspot_integrity(hotspot: DamageHotspot):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.4
    
    For any DamageHotspot instance, all required fields should be present
    and have valid types.
    """
    # Verify required fields are present
    assert hotspot.id is not None
    assert isinstance(hotspot.id, int)
    
    assert hotspot.x is not None
    assert isinstance(hotspot.x, (int, float))
    
    assert hotspot.y is not None
    assert isinstance(hotspot.y, (int, float))
    
    assert hotspot.damage_type is not None
    assert isinstance(hotspot.damage_type, str)
    
    assert hotspot.severity is not None
    assert isinstance(hotspot.severity, str)
    
    assert hotspot.label is not None
    assert isinstance(hotspot.label, str)
    
    assert hotspot.treatment is not None
    assert isinstance(hotspot.treatment, str)
    
    assert hotspot.icon is not None
    assert isinstance(hotspot.icon, str)
    
    # Verify the model can be serialized and deserialized
    json_data = hotspot.model_dump()
    assert isinstance(json_data, dict)
    
    # Verify model can be reconstructed from dict
    reconstructed = DamageHotspot(**json_data)
    assert reconstructed.id == hotspot.id
    assert reconstructed.x == hotspot.x
    assert reconstructed.y == hotspot.y


@pytest.mark.property
@given(result=arbitrary_resurrection_result())
@settings(max_examples=100)
def test_property_resurrection_result_integrity(result: ResurrectionResult):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.5
    
    For any ResurrectionResult instance, all required fields should be
    present and have valid types.
    """
    # Verify required fields are present
    assert result.segments is not None
    assert isinstance(result.segments, list)
    for segment in result.segments:
        assert isinstance(segment, TextSegment)
    
    assert result.overall_confidence is not None
    assert isinstance(result.overall_confidence, (int, float))
    
    assert result.agent_messages is not None
    assert isinstance(result.agent_messages, list)
    for msg in result.agent_messages:
        assert isinstance(msg, AgentMessage)
    
    assert result.processing_time_ms is not None
    assert isinstance(result.processing_time_ms, int)
    
    # Verify optional fields have correct types when present
    if result.raw_ocr_text is not None:
        assert isinstance(result.raw_ocr_text, str)
    
    if result.transliterated_text is not None:
        assert isinstance(result.transliterated_text, str)
    
    if result.historian_analysis is not None:
        assert isinstance(result.historian_analysis, str)
    
    if result.validator_corrections is not None:
        assert isinstance(result.validator_corrections, list)
        for correction in result.validator_corrections:
            assert isinstance(correction, str)
    
    if result.repair_recommendations is not None:
        assert isinstance(result.repair_recommendations, list)
        for rec in result.repair_recommendations:
            assert isinstance(rec, RepairRecommendation)
    
    if result.damage_hotspots is not None:
        assert isinstance(result.damage_hotspots, list)
        for hotspot in result.damage_hotspots:
            assert isinstance(hotspot, DamageHotspot)
    
    if result.archive_id is not None:
        assert isinstance(result.archive_id, str)
    
    # Verify the model can be serialized and deserialized
    json_data = result.model_dump()
    assert isinstance(json_data, dict)
    
    # Verify model can be reconstructed from dict
    reconstructed = ResurrectionResult(**json_data)
    assert len(reconstructed.segments) == len(result.segments)
    assert reconstructed.overall_confidence == result.overall_confidence
    assert len(reconstructed.agent_messages) == len(result.agent_messages)
    assert reconstructed.processing_time_ms == result.processing_time_ms


@pytest.mark.property
@given(result=arbitrary_resurrection_result())
@settings(max_examples=100)
def test_property_resurrection_result_non_empty_collections(result: ResurrectionResult):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.5
    
    For any ResurrectionResult instance, segments and agent_messages
    should be non-empty lists.
    """
    # Segments should always have at least one element
    assert len(result.segments) > 0
    
    # Agent messages should always have at least one element
    assert len(result.agent_messages) > 0


@pytest.mark.property
@given(result=arbitrary_resurrection_result())
@settings(max_examples=100, deadline=None)
def test_property_resurrection_result_json_serialization(result: ResurrectionResult):
    """
    Feature: code-quality-validation, Property 4: Data Model Integrity
    Validates: Requirements 10.5
    
    For any ResurrectionResult instance, it should be serializable to JSON
    and deserializable back to an equivalent object.
    """
    # Serialize to JSON
    json_str = result.model_dump_json()
    assert isinstance(json_str, str)
    assert len(json_str) > 0
    
    # Deserialize from JSON
    reconstructed = ResurrectionResult.model_validate_json(json_str)
    
    # Verify key fields match
    assert len(reconstructed.segments) == len(result.segments)
    assert reconstructed.overall_confidence == result.overall_confidence
    assert len(reconstructed.agent_messages) == len(result.agent_messages)
    assert reconstructed.processing_time_ms == result.processing_time_ms
