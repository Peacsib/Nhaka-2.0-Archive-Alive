"""
Property-based test for Scanner agent context propagation.

Feature: code-quality-validation, Property 3: Context Propagation (Scanner)
Validates: Requirements 2.2, 2.3, 2.6

For any agent that completes successfully, the context dictionary should contain 
all fields that agent is responsible for populating.

For Scanner: raw_text and ocr_confidence must be populated after successful processing.
"""
import pytest
from hypothesis import given, settings, strategies as st
from unittest.mock import AsyncMock, patch
from datetime import datetime

import sys
sys.path.insert(0, '.')
from main import ScannerAgent
from tests.generators import arbitrary_text, arbitrary_confidence, arbitrary_image_bytes


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    image_data=arbitrary_image_bytes(min_size=100, max_size=5000),
    ocr_text=arbitrary_text(min_length=10, max_length=500),
    ocr_conf=arbitrary_confidence()
)
async def test_scanner_context_propagation(image_data, ocr_text, ocr_conf):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Scanner)
    Validates: Requirements 2.2, 2.3, 2.6
    
    Property: For any successful Scanner execution, the context must contain
    'raw_text' and 'ocr_confidence' fields populated by the Scanner.
    """
    scanner = ScannerAgent()
    context = {
        "image_data": image_data,
        "start_time": datetime.utcnow()
    }
    
    # Mock the PaddleOCR-VL API call to return success
    with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
        mock_ocr.return_value = {
            "success": True,
            "text": ocr_text,
            "confidence": ocr_conf
        }
        
        # Process the document
        messages = []
        async for message in scanner.process(context):
            messages.append(message)
        
        # PROPERTY: Scanner must populate raw_text in context
        assert "raw_text" in context, "Scanner must populate 'raw_text' in context"
        
        # PROPERTY: Scanner must populate ocr_confidence in context
        assert "ocr_confidence" in context, "Scanner must populate 'ocr_confidence' in context"
        
        # PROPERTY: raw_text must match the OCR result
        assert context["raw_text"] == ocr_text, "raw_text must match OCR output"
        
        # PROPERTY: ocr_confidence must match the OCR result
        assert context["ocr_confidence"] == ocr_conf, "ocr_confidence must match OCR output"
        
        # PROPERTY: Scanner must emit at least one message
        assert len(messages) > 0, "Scanner must emit at least one message"
        
        # PROPERTY: All messages must be from Scanner agent
        from main import AgentType
        for msg in messages:
            assert msg.agent == AgentType.SCANNER, "All messages must be from Scanner agent"


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    image_data=arbitrary_image_bytes(min_size=100, max_size=5000)
)
async def test_scanner_context_propagation_on_failure(image_data):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Scanner)
    Validates: Requirements 2.5, 11.2
    
    Property: When Scanner fails, it should raise an exception and context
    should have empty/zero values for raw_text and ocr_confidence.
    """
    scanner = ScannerAgent()
    context = {
        "image_data": image_data,
        "start_time": datetime.utcnow()
    }
    
    # Mock the PaddleOCR-VL API call to return failure
    with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
        mock_ocr.return_value = {
            "success": False,
            "text": "",
            "confidence": 0
        }
        
        # Scanner should raise an exception on failure
        with pytest.raises(Exception) as exc_info:
            messages = []
            async for message in scanner.process(context):
                messages.append(message)
        
        # PROPERTY: Exception message must be clear
        assert "PaddleOCR-VL API failed" in str(exc_info.value)
        
        # PROPERTY: Context should have empty/zero values
        assert context.get("raw_text", "") == ""
        assert context.get("ocr_confidence", 0) == 0


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=50, deadline=None)
@given(
    ocr_text=arbitrary_text(min_length=50, max_length=300, include_doke=True),
    ocr_conf=arbitrary_confidence()
)
async def test_scanner_doke_detection_in_context(ocr_text, ocr_conf):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Scanner)
    Validates: Requirements 2.4
    
    Property: When Scanner detects Doke characters, it should emit a message
    with metadata containing the detected characters.
    """
    scanner = ScannerAgent()
    context = {
        "image_data": b"fake_image_data",
        "start_time": datetime.utcnow()
    }
    
    # Check if text actually contains Doke characters
    doke_chars = ['ɓ', 'ɗ', 'ȿ', 'ɀ', 'ŋ', 'ʃ', 'ʒ', 'ṱ', 'ḓ', 'ḽ', 'ṋ']
    has_doke = any(char in ocr_text for char in doke_chars)
    
    # Mock the PaddleOCR-VL API call
    with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
        mock_ocr.return_value = {
            "success": True,
            "text": ocr_text,
            "confidence": ocr_conf
        }
        
        # Process the document
        messages = []
        async for message in scanner.process(context):
            messages.append(message)
        
        # PROPERTY: Context must be populated
        assert "raw_text" in context
        assert "ocr_confidence" in context
        
        # PROPERTY: If text has Doke characters, a detection message must be emitted
        doke_messages = [m for m in messages if "DOKE ORTHOGRAPHY DETECTED" in m.message]
        
        if has_doke:
            assert len(doke_messages) > 0, "Doke detection message must be emitted when Doke chars present"
            # Verify metadata contains detected characters
            doke_msg = doke_messages[0]
            assert doke_msg.metadata is not None
            assert "doke_chars" in doke_msg.metadata
        else:
            # If no Doke characters, should emit standard script message
            standard_messages = [m for m in messages if "Standard Latin script" in m.message]
            assert len(standard_messages) > 0, "Standard script message must be emitted when no Doke chars"
