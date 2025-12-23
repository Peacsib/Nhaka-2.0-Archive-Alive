"""
Unit tests for ValidatorAgent.
Tests specific examples, edge cases, and error conditions.

Requirements: 5.2, 5.5
"""
import pytest
import asyncio
from datetime import datetime

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import ValidatorAgent, AgentType


# =============================================================================
# UNIT TESTS - SPECIFIC EXAMPLES
# =============================================================================

@pytest.mark.asyncio
async def test_validator_with_low_ocr_confidence():
    """
    Test Validator with low OCR confidence (example).
    
    Requirements: 5.2
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Some text extracted from document",
        "transliterated_text": "Some text extracted from document",
        "ocr_confidence": 45.0,  # Below medium threshold (60)
        "verified_facts": ["Fact 1", "Fact 2"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that low confidence warning is issued
    warning_messages = [m for m in messages if "WARNING" in m.message and "confidence" in m.message.lower()]
    assert len(warning_messages) > 0, "Should emit warning for low OCR confidence"
    
    # Check that warning is marked as debate
    assert any(m.is_debate for m in warning_messages), "Warning should be marked as debate"
    
    # Check context is populated
    assert "final_confidence" in context, "Should populate final_confidence"
    assert "validator_warnings" in context, "Should populate validator_warnings"
    assert "validator_corrections" in context, "Should populate validator_corrections"
    
    # Check that warnings list contains the low confidence warning
    assert len(context["validator_warnings"]) > 0, "Should have warnings"
    assert any("confidence" in w.lower() for w in context["validator_warnings"]), "Should warn about confidence"


@pytest.mark.asyncio
async def test_validator_with_high_confidence():
    """
    Test Validator with high confidence.
    
    Requirements: 5.2
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Clear text with high OCR quality",
        "transliterated_text": "Clear text with high OCR quality",
        "ocr_confidence": 92.0,  # Above high threshold (80)
        "verified_facts": ["Fact 1", "Fact 2", "Fact 3"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that no warnings are issued for high confidence
    warning_messages = [m for m in messages if "WARNING" in m.message and "confidence" in m.message.lower()]
    assert len(warning_messages) == 0, "Should not emit warning for high OCR confidence"
    
    # Check that final confidence is calculated
    assert "final_confidence" in context, "Should populate final_confidence"
    
    # Final confidence should be high
    assert context["final_confidence"] >= validator.CONFIDENCE_THRESHOLDS["high"], "Final confidence should be high"
    
    # Check completion message indicates HIGH confidence level
    completion_messages = [m for m in messages if "COMPLETE" in m.message and "HIGH" in m.message]
    assert len(completion_messages) > 0, "Should indicate HIGH confidence level"


@pytest.mark.asyncio
async def test_validator_with_ai_validation_available():
    """
    Test Validator with AI validation available (example).
    
    Requirements: 5.5
    """
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Historical document about Lobengula and Rudd in 1888",
        "transliterated_text": "Historical document about Lobengula and Rudd in 1888",
        "ocr_confidence": 75.0,
        "verified_facts": ["Rudd-Lobengula treaty context", "Date 1888 verified"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that final confidence is calculated
    assert "final_confidence" in context, "Should populate final_confidence"
    
    # Check that validator completes
    completion_messages = [m for m in messages if "COMPLETE" in m.message]
    assert len(completion_messages) > 0, "Should emit completion message"



# =============================================================================
# UNIT TESTS - EDGE CASES
# =============================================================================

@pytest.mark.asyncio
async def test_validator_with_empty_text():
    """Test Validator with empty text."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "",
        "transliterated_text": "",
        "ocr_confidence": 50.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit messages even with empty text"
    assert "final_confidence" in context
    assert "validator_warnings" in context


@pytest.mark.asyncio
async def test_validator_with_missing_context_fields():
    """Test Validator with missing context fields."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "start_time": datetime.utcnow()
        # Missing most fields
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should handle missing fields gracefully"
    assert "final_confidence" in context, "Should still calculate final confidence"


@pytest.mark.asyncio
async def test_validator_with_inconsistent_text_lengths():
    """Test Validator detects inconsistency when text length changes drastically."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Short text",  # 10 characters
        "transliterated_text": "This is a much longer text that has been significantly expanded during transliteration process",  # Much longer
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
    # Check that inconsistency is detected
    inconsistency_messages = [m for m in messages if "INCONSISTENCY" in m.message]
    assert len(inconsistency_messages) > 0, "Should detect text length inconsistency"
    
    # Check that inconsistency is marked as debate
    assert any(m.is_debate for m in inconsistency_messages), "Inconsistency should be marked as debate"


@pytest.mark.asyncio
async def test_validator_with_anomalies():
    """Test Validator handles historical anomalies."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Some historical text",
        "transliterated_text": "Some historical text",
        "ocr_confidence": 70.0,
        "verified_facts": ["Fact 1"],
        "historical_anomalies": ["Anomaly 1: Date mismatch", "Anomaly 2: Figure not found"],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert
    # Check that anomalies are reported
    anomaly_messages = [m for m in messages if "ANOMALY" in m.message]
    assert len(anomaly_messages) >= 2, "Should report all anomalies"
    
    # Check that anomalies are marked as debate
    assert all(m.is_debate for m in anomaly_messages), "Anomalies should be marked as debate"


# =============================================================================
# UNIT TESTS - HELPER METHODS
# =============================================================================

def test_detect_inconsistencies_method():
    """Test the _detect_inconsistencies method directly."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Short",  # 5 characters
        "transliterated_text": "This is much longer text",  # 24 characters
    }
    
    # Act
    inconsistencies = validator._detect_inconsistencies(context)
    
    # Assert
    assert len(inconsistencies) > 0, "Should detect inconsistency"
    assert any("length" in inc.lower() for inc in inconsistencies), "Should mention length change"


def test_detect_inconsistencies_no_change():
    """Test that no inconsistency is detected for similar length texts."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "This is some text",
        "transliterated_text": "This is some text",  # Same length
    }
    
    # Act
    inconsistencies = validator._detect_inconsistencies(context)
    
    # Assert
    assert len(inconsistencies) == 0, "Should not detect inconsistency for same length"


def test_calculate_final_confidence_method():
    """Test the _calculate_final_confidence method directly."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "ocr_confidence": 80.0,
        "verified_facts": ["Fact 1", "Fact 2"],
        "validator_warnings": []
    }
    
    # Act
    final_confidence = validator._calculate_final_confidence(context)
    
    # Assert
    assert 0 <= final_confidence <= 100, "Confidence should be between 0 and 100"
    assert final_confidence > 0, "Should have positive confidence with good inputs"


def test_calculate_final_confidence_with_warnings():
    """Test that warnings reduce final confidence."""
    # Arrange
    validator = ValidatorAgent()
    validator.warnings = ["Warning 1", "Warning 2", "Warning 3"]
    
    context_no_warnings = {
        "ocr_confidence": 80.0,
        "verified_facts": ["Fact 1", "Fact 2"],
        "validator_warnings": []
    }
    
    context_with_warnings = {
        "ocr_confidence": 80.0,
        "verified_facts": ["Fact 1", "Fact 2"],
        "validator_warnings": validator.warnings
    }
    
    # Act
    confidence_no_warnings = validator._calculate_final_confidence(context_no_warnings)
    confidence_with_warnings = validator._calculate_final_confidence(context_with_warnings)
    
    # Assert
    assert confidence_with_warnings < confidence_no_warnings, "Warnings should reduce confidence"


# =============================================================================
# UNIT TESTS - CONTEXT POPULATION
# =============================================================================

@pytest.mark.asyncio
async def test_validator_populates_all_required_context_fields():
    """Test that Validator populates all required context fields."""
    # Arrange
    validator = ValidatorAgent()
    context = {
        "raw_text": "Some text",
        "transliterated_text": "Some text",
        "ocr_confidence": 75.0,
        "verified_facts": ["Fact 1"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in validator.process(context):
        messages.append(msg)
    
    # Assert - Check all required fields are populated
    assert "final_confidence" in context, "Should populate final_confidence"
    assert "validator_warnings" in context, "Should populate validator_warnings"
    assert "validator_corrections" in context, "Should populate validator_corrections"
    
    # Verify types
    assert isinstance(context["final_confidence"], (int, float))
    assert isinstance(context["validator_warnings"], list)
    assert isinstance(context["validator_corrections"], list)


@pytest.mark.asyncio
async def test_validator_agent_type_and_metadata():
    """Test that Validator has correct agent type and metadata."""
    # Arrange
    validator = ValidatorAgent()
    
    # Assert
    assert validator.agent_type == AgentType.VALIDATOR
    assert validator.name == "Validator"
    assert "hallucination" in validator.description.lower() or "verification" in validator.description.lower()
    
    # Check confidence thresholds exist
    assert hasattr(validator, 'CONFIDENCE_THRESHOLDS')
    assert "high" in validator.CONFIDENCE_THRESHOLDS
    assert "medium" in validator.CONFIDENCE_THRESHOLDS
    assert "low" in validator.CONFIDENCE_THRESHOLDS
    
    # Verify threshold values
    assert validator.CONFIDENCE_THRESHOLDS["high"] == 80
    assert validator.CONFIDENCE_THRESHOLDS["medium"] == 60
    assert validator.CONFIDENCE_THRESHOLDS["low"] == 40


@pytest.mark.asyncio
async def test_validator_confidence_level_classification():
    """Test that Validator correctly classifies confidence levels."""
    # Arrange
    validator = ValidatorAgent()
    
    # Test HIGH confidence
    context_high = {
        "raw_text": "Text",
        "transliterated_text": "Text",
        "ocr_confidence": 90.0,
        "verified_facts": ["F1", "F2", "F3", "F4", "F5"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    messages_high = []
    async for msg in validator.process(context_high):
        messages_high.append(msg)
    
    completion_high = [m for m in messages_high if "COMPLETE" in m.message]
    assert any("HIGH" in m.message for m in completion_high), "Should classify as HIGH"
    
    # Test MEDIUM confidence
    validator2 = ValidatorAgent()
    context_medium = {
        "raw_text": "Text",
        "transliterated_text": "Text",
        "ocr_confidence": 65.0,
        "verified_facts": ["F1"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    messages_medium = []
    async for msg in validator2.process(context_medium):
        messages_medium.append(msg)
    
    completion_medium = [m for m in messages_medium if "COMPLETE" in m.message]
    assert any("MEDIUM" in m.message for m in completion_medium), "Should classify as MEDIUM"
    
    # Test LOW confidence
    validator3 = ValidatorAgent()
    context_low = {
        "raw_text": "Text",
        "transliterated_text": "Text",
        "ocr_confidence": 30.0,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    messages_low = []
    async for msg in validator3.process(context_low):
        messages_low.append(msg)
    
    completion_low = [m for m in messages_low if "COMPLETE" in m.message]
    assert any("LOW" in m.message for m in completion_low), "Should classify as LOW"
