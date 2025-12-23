"""
Property-based test for Validator agent context propagation.

Feature: code-quality-validation, Property 3: Context Propagation (Validator)
Validates: Requirements 5.4

For any agent that completes successfully, the context dictionary should contain 
all fields that agent is responsible for populating.

For Validator: final_confidence, validator_warnings, and validator_corrections 
must be populated after successful processing.
"""
import pytest
from hypothesis import given, settings, strategies as st
from unittest.mock import AsyncMock, patch
from datetime import datetime

import sys
sys.path.insert(0, '.')
from main import ValidatorAgent, AgentType
from tests.generators import arbitrary_text, arbitrary_confidence


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    raw_text=arbitrary_text(min_length=10, max_length=500),
    transliterated_text=arbitrary_text(min_length=10, max_length=500),
    ocr_conf=arbitrary_confidence(),
    num_facts=st.integers(min_value=0, max_value=10),
    num_anomalies=st.integers(min_value=0, max_value=5)
)
async def test_validator_context_propagation(raw_text, transliterated_text, ocr_conf, num_facts, num_anomalies):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Validator)
    Validates: Requirements 5.4
    
    Property: For any successful Validator execution, the context must contain
    'final_confidence', 'validator_warnings', and 'validator_corrections' fields 
    populated by the Validator.
    """
    validator = ValidatorAgent()
    context = {
        "raw_text": raw_text,
        "transliterated_text": transliterated_text,
        "ocr_confidence": ocr_conf,
        "verified_facts": [f"Fact {i}" for i in range(num_facts)],
        "historical_anomalies": [f"Anomaly {i}" for i in range(num_anomalies)],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls to avoid real API calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Process the document
        messages = []
        async for message in validator.process(context):
            messages.append(message)
        
        # PROPERTY: Validator must populate final_confidence in context
        assert "final_confidence" in context, "Validator must populate 'final_confidence' in context"
        
        # PROPERTY: Validator must populate validator_warnings in context
        assert "validator_warnings" in context, "Validator must populate 'validator_warnings' in context"
        
        # PROPERTY: Validator must populate validator_corrections in context
        assert "validator_corrections" in context, "Validator must populate 'validator_corrections' in context"
        
        # PROPERTY: final_confidence must be a valid number between 0-100
        assert isinstance(context["final_confidence"], (int, float)), "final_confidence must be a number"
        assert 0 <= context["final_confidence"] <= 100, "final_confidence must be between 0 and 100"
        
        # PROPERTY: validator_warnings must be a list
        assert isinstance(context["validator_warnings"], list), "validator_warnings must be a list"
        
        # PROPERTY: validator_corrections must be a list
        assert isinstance(context["validator_corrections"], list), "validator_corrections must be a list"
        
        # PROPERTY: Validator must emit at least one message
        assert len(messages) > 0, "Validator must emit at least one message"
        
        # PROPERTY: All messages must be from Validator agent
        for msg in messages:
            assert msg.agent == AgentType.VALIDATOR, "All messages must be from Validator agent"


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    raw_text=arbitrary_text(min_length=50, max_length=200),
    ocr_conf=arbitrary_confidence()
)
async def test_validator_final_confidence_always_calculated(raw_text, ocr_conf):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Validator)
    Validates: Requirements 5.4
    
    Property: For any valid context, Validator must always calculate and populate
    final_confidence, regardless of input quality.
    """
    validator = ValidatorAgent()
    context = {
        "raw_text": raw_text,
        "transliterated_text": raw_text,  # Same as raw
        "ocr_confidence": ocr_conf,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Process
        messages = []
        async for message in validator.process(context):
            messages.append(message)
        
        # PROPERTY: final_confidence must always be populated
        assert "final_confidence" in context, "final_confidence must always be populated"
        
        # PROPERTY: final_confidence must be valid
        final_conf = context["final_confidence"]
        assert isinstance(final_conf, (int, float)), "final_confidence must be numeric"
        assert 0 <= final_conf <= 100, f"final_confidence {final_conf} must be in range [0, 100]"
        assert not (isinstance(final_conf, float) and final_conf != final_conf), "final_confidence must not be NaN"


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    text=arbitrary_text(min_length=20, max_length=300),
    ocr_conf=arbitrary_confidence(),
    has_warnings=st.booleans()
)
async def test_validator_warnings_list_always_present(text, ocr_conf, has_warnings):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Validator)
    Validates: Requirements 5.4
    
    Property: Validator must always populate validator_warnings list in context,
    even if the list is empty (no warnings).
    """
    validator = ValidatorAgent()
    
    # Create context that may or may not trigger warnings
    if has_warnings:
        # Low OCR confidence should trigger warning
        ocr_conf = min(ocr_conf, 50.0)
    
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "ocr_confidence": ocr_conf,
        "verified_facts": ["Fact 1"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Process
        messages = []
        async for message in validator.process(context):
            messages.append(message)
        
        # PROPERTY: validator_warnings must always be present
        assert "validator_warnings" in context, "validator_warnings must always be in context"
        
        # PROPERTY: validator_warnings must be a list
        assert isinstance(context["validator_warnings"], list), "validator_warnings must be a list"
        
        # PROPERTY: If OCR confidence is low, warnings list should not be empty
        if ocr_conf < 60:  # Below medium threshold
            assert len(context["validator_warnings"]) > 0, "Should have warnings for low OCR confidence"


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    raw_text=arbitrary_text(min_length=10, max_length=200),
    trans_text=arbitrary_text(min_length=10, max_length=200),
    ocr_conf=arbitrary_confidence()
)
async def test_validator_corrections_list_always_present(raw_text, trans_text, ocr_conf):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Validator)
    Validates: Requirements 5.4
    
    Property: Validator must always populate validator_corrections list in context,
    even if the list is empty (no corrections).
    """
    validator = ValidatorAgent()
    context = {
        "raw_text": raw_text,
        "transliterated_text": trans_text,
        "ocr_confidence": ocr_conf,
        "verified_facts": [],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Process
        messages = []
        async for message in validator.process(context):
            messages.append(message)
        
        # PROPERTY: validator_corrections must always be present
        assert "validator_corrections" in context, "validator_corrections must always be in context"
        
        # PROPERTY: validator_corrections must be a list
        assert isinstance(context["validator_corrections"], list), "validator_corrections must be a list"


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=50, deadline=None)
@given(
    ocr_conf=arbitrary_confidence(),
    num_facts=st.integers(min_value=0, max_value=15),
    num_anomalies=st.integers(min_value=0, max_value=8)
)
async def test_validator_context_fields_persist_after_processing(ocr_conf, num_facts, num_anomalies):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Validator)
    Validates: Requirements 5.4
    
    Property: All context fields populated by Validator must persist after
    processing completes and be accessible to subsequent agents.
    """
    validator = ValidatorAgent()
    context = {
        "raw_text": "Sample historical document text",
        "transliterated_text": "Sample historical document text",
        "ocr_confidence": ocr_conf,
        "verified_facts": [f"Historical fact {i}" for i in range(num_facts)],
        "historical_anomalies": [f"Anomaly {i}" for i in range(num_anomalies)],
        "start_time": datetime.utcnow()
    }
    
    # Store original context keys
    original_keys = set(context.keys())
    
    # Mock the AI calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Process
        messages = []
        async for message in validator.process(context):
            messages.append(message)
        
        # PROPERTY: Original context fields must still be present
        for key in original_keys:
            assert key in context, f"Original context field '{key}' must persist"
        
        # PROPERTY: New Validator fields must be added
        assert "final_confidence" in context
        assert "validator_warnings" in context
        assert "validator_corrections" in context
        
        # PROPERTY: Context must have more keys after processing
        assert len(context.keys()) >= len(original_keys), "Context should have at least as many keys after processing"
        
        # PROPERTY: Validator should not remove any existing context fields
        new_keys = set(context.keys())
        assert original_keys.issubset(new_keys), "Validator must not remove existing context fields"


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=50, deadline=None)
@given(
    text=arbitrary_text(min_length=50, max_length=300),
    ocr_conf=arbitrary_confidence()
)
async def test_validator_emits_completion_message(text, ocr_conf):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Validator)
    Validates: Requirements 5.4
    
    Property: Validator must emit a completion message indicating successful
    processing and confidence level classification.
    """
    validator = ValidatorAgent()
    context = {
        "raw_text": text,
        "transliterated_text": text,
        "ocr_confidence": ocr_conf,
        "verified_facts": ["Fact 1", "Fact 2"],
        "historical_anomalies": [],
        "start_time": datetime.utcnow()
    }
    
    # Mock the AI calls
    with patch.object(validator, '_get_ai_validation', new_callable=AsyncMock) as mock_ai, \
         patch.object(validator, '_reconstruct_document', new_callable=AsyncMock) as mock_reconstruct:
        mock_ai.return_value = None
        mock_reconstruct.return_value = None
        
        # Process
        messages = []
        async for message in validator.process(context):
            messages.append(message)
        
        # PROPERTY: Must emit at least one message
        assert len(messages) > 0, "Validator must emit at least one message"
        
        # PROPERTY: Must emit a completion message
        completion_messages = [m for m in messages if "COMPLETE" in m.message]
        assert len(completion_messages) > 0, "Validator must emit a completion message"
        
        # PROPERTY: Completion message must indicate confidence level
        completion_msg = completion_messages[0]
        assert any(level in completion_msg.message for level in ["HIGH", "MEDIUM", "LOW"]), \
            "Completion message must indicate confidence level (HIGH/MEDIUM/LOW)"
        
        # PROPERTY: Completion message must be from Validator
        assert completion_msg.agent == AgentType.VALIDATOR, "Completion message must be from Validator"
