"""
Unit tests for Scanner agent.

Tests Scanner with Doke character document (example)
Tests Scanner with missing API key (error handling)
Tests Scanner with API failure (error handling)
Tests Scanner with API timeout (error handling)

Requirements: 2.1, 2.4, 2.5, 11.1, 11.2, 11.3
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

import sys
sys.path.insert(0, '.')
from main import ScannerAgent, AgentType
from tests.fixtures import SAMPLE_DOKE_TEXT


@pytest.mark.unit
@pytest.mark.asyncio
class TestScannerAgent:
    """Unit tests for ScannerAgent."""
    
    async def test_scanner_with_doke_characters(self):
        """
        Test Scanner with Doke character document (example).
        Requirements: 2.1, 2.4
        """
        scanner = ScannerAgent()
        context = {
            "image_data": b"fake_image_data",
            "start_time": datetime.utcnow()
        }
        
        # Mock the PaddleOCR-VL API call to return text with Doke characters
        with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
            mock_ocr.return_value = {
                "success": True,
                "text": SAMPLE_DOKE_TEXT,
                "confidence": 82.5
            }
            
            # Collect all messages
            messages = []
            async for message in scanner.process(context):
                messages.append(message)
            
            # Verify Scanner emitted messages
            assert len(messages) > 0
            
            # Verify context was populated
            assert "raw_text" in context
            assert "ocr_confidence" in context
            assert context["raw_text"] == SAMPLE_DOKE_TEXT
            assert context["ocr_confidence"] == 82.5
            
            # Verify Doke character detection message was emitted
            doke_messages = [m for m in messages if "DOKE ORTHOGRAPHY DETECTED" in m.message]
            assert len(doke_messages) > 0
            
            # Verify the Doke message contains detected characters
            doke_msg = doke_messages[0]
            assert doke_msg.agent == AgentType.SCANNER
            assert doke_msg.confidence is not None
            assert doke_msg.metadata is not None
            assert "doke_chars" in doke_msg.metadata
    
    async def test_scanner_with_missing_api_key(self):
        """
        Test Scanner with missing API key (error handling).
        Requirements: 11.1
        """
        scanner = ScannerAgent()
        scanner.api_key = ""  # Simulate missing API key
        
        context = {
            "image_data": b"fake_image_data",
            "start_time": datetime.utcnow()
        }
        
        # The _call_paddleocr_vl method should return failure when API key is missing
        result = await scanner._call_paddleocr_vl(b"fake_image_data")
        
        assert result["success"] is False
        assert result["text"] == ""
        assert result["confidence"] == 0
    
    async def test_scanner_with_api_failure(self):
        """
        Test Scanner with API failure (error handling).
        Requirements: 11.2
        """
        scanner = ScannerAgent()
        context = {
            "image_data": b"fake_image_data",
            "start_time": datetime.utcnow()
        }
        
        # Mock the PaddleOCR-VL API call to return failure
        with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
            mock_ocr.return_value = {
                "success": False,
                "text": "",
                "confidence": 0
            }
            
            # Scanner should raise an exception when API fails
            with pytest.raises(Exception) as exc_info:
                messages = []
                async for message in scanner.process(context):
                    messages.append(message)
            
            # Verify the exception message is clear
            assert "PaddleOCR-VL API failed" in str(exc_info.value)
            
            # Verify context has empty values
            assert context.get("raw_text", "") == ""
            assert context.get("ocr_confidence", 0) == 0
    
    async def test_scanner_with_api_timeout(self):
        """
        Test Scanner with API timeout (error handling).
        Requirements: 11.3
        """
        import httpx
        
        scanner = ScannerAgent()
        scanner.api_key = "test_key"
        
        # Mock httpx.AsyncClient to raise TimeoutException
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            mock_client.post = AsyncMock(side_effect=httpx.TimeoutException("Request timeout"))
            mock_client_class.return_value = mock_client
            
            # Call the API method
            result = await scanner._call_paddleocr_vl(b"fake_image_data")
            
            # Verify timeout is handled gracefully
            assert result["success"] is False
            assert result["text"] == ""
            assert result["confidence"] == 0
    
    async def test_scanner_no_doke_characters(self):
        """
        Test Scanner with text that has no Doke characters.
        Requirements: 2.4
        """
        scanner = ScannerAgent()
        context = {
            "image_data": b"fake_image_data",
            "start_time": datetime.utcnow()
        }
        
        # Text without Doke characters
        modern_text = "This is a document in standard Latin script with no special characters."
        
        # Mock the PaddleOCR-VL API call
        with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
            mock_ocr.return_value = {
                "success": True,
                "text": modern_text,
                "confidence": 85.0
            }
            
            # Collect all messages
            messages = []
            async for message in scanner.process(context):
                messages.append(message)
            
            # Verify context was populated
            assert context["raw_text"] == modern_text
            assert context["ocr_confidence"] == 85.0
            
            # Verify standard script message was emitted (not Doke detection)
            standard_messages = [m for m in messages if "Standard Latin script" in m.message]
            assert len(standard_messages) > 0
            
            # Verify NO Doke detection message
            doke_messages = [m for m in messages if "DOKE ORTHOGRAPHY DETECTED" in m.message]
            assert len(doke_messages) == 0
    
    async def test_scanner_completion_message(self):
        """
        Test Scanner emits completion message.
        Requirements: 2.1
        """
        scanner = ScannerAgent()
        context = {
            "image_data": b"fake_image_data",
            "start_time": datetime.utcnow()
        }
        
        # Mock successful API call
        with patch.object(scanner, '_call_paddleocr_vl', new_callable=AsyncMock) as mock_ocr:
            mock_ocr.return_value = {
                "success": True,
                "text": "Sample text",
                "confidence": 75.0
            }
            
            # Collect all messages
            messages = []
            async for message in scanner.process(context):
                messages.append(message)
            
            # Verify completion message exists
            completion_messages = [m for m in messages if "SCANNER COMPLETE" in m.message]
            assert len(completion_messages) > 0
            
            # Verify completion message has confidence
            completion_msg = completion_messages[0]
            assert completion_msg.confidence == 75.0
