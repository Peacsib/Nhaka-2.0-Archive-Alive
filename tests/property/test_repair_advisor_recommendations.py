"""
Property-based test for Repair Advisor recommendation generation.

Feature: code-quality-validation, Property 13: Repair Recommendation Generation
Validates: Requirements 6.1, 6.2
"""
import pytest
from hypothesis import given, settings, strategies as st
from unittest.mock import AsyncMock, patch
from datetime import datetime

import sys
sys.path.insert(0, '.')
from main import PhysicalRepairAdvisorAgent, RepairRecommendation
from tests.generators import arbitrary_text, arbitrary_confidence


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    raw_text=arbitrary_text(min_length=20, max_length=300),
    ocr_conf=st.floats(min_value=0, max_value=69.9)  # Below 70% threshold
)
async def test_repair_recommendations_for_low_confidence(raw_text, ocr_conf):
    """
    Feature: code-quality-validation, Property 13: Repair Recommendation Generation
    Validates: Requirements 6.1, 6.2
    
    Property: For any document with OCR confidence below 70%, the Repair Advisor 
    should generate at least one RepairRecommendation.
    """
    advisor = PhysicalRepairAdvisorAgent()
    context = {
        "raw_text": raw_text,
        "ocr_confidence": ocr_conf,
        "image_data": b"fake_image_data",
        "start_time": datetime.utcnow()
    }
    
    # Mock AI calls
    with patch.object(advisor, '_get_ai_damage_analysis', new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = None
        
        # Process
        messages = []
        async for message in advisor.process(context):
            messages.append(message)
        
        # PROPERTY: Low confidence should trigger recommendations
        recommendations = context.get("repair_recommendations", [])
        
        if ocr_conf < 70:
            assert len(recommendations) > 0, f"Should have recommendations for OCR confidence {ocr_conf:.1f}%"
            
            # Verify all recommendations are valid
            for rec in recommendations:
                assert isinstance(rec, RepairRecommendation)
                assert rec.issue, "Recommendation must have issue"
                assert rec.severity in ["critical", "moderate", "minor"]
                assert rec.recommendation, "Recommendation must have treatment"
