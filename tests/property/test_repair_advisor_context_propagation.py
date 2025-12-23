"""
Property-based test for Repair Advisor context propagation.

Feature: code-quality-validation, Property 3: Context Propagation (Repair Advisor)
Validates: Requirements 6.5, 6.6
"""
import pytest
from hypothesis import given, settings, strategies as st
from unittest.mock import AsyncMock, patch
from datetime import datetime

import sys
sys.path.insert(0, '.')
from main import PhysicalRepairAdvisorAgent, AgentType
from tests.generators import arbitrary_text, arbitrary_confidence


@pytest.mark.property
@pytest.mark.asyncio
@settings(max_examples=100, deadline=None)
@given(
    raw_text=arbitrary_text(min_length=20, max_length=300),
    ocr_conf=arbitrary_confidence()
)
async def test_repair_advisor_context_propagation(raw_text, ocr_conf):
    """
    Feature: code-quality-validation, Property 3: Context Propagation (Repair Advisor)
    Validates: Requirements 6.5, 6.6
    
    Property: For any successful Repair Advisor execution, the context must contain
    'repair_recommendations', 'damage_hotspots', and 'digitization_priority' fields.
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
        
        # PROPERTY: Must populate repair_recommendations
        assert "repair_recommendations" in context
        assert isinstance(context["repair_recommendations"], list)
        
        # PROPERTY: Must populate damage_hotspots
        assert "damage_hotspots" in context
        assert isinstance(context["damage_hotspots"], list)
        
        # PROPERTY: Must populate digitization_priority
        assert "digitization_priority" in context
        assert isinstance(context["digitization_priority"], (int, float))
        assert 0 <= context["digitization_priority"] <= 100
        
        # PROPERTY: Must emit messages
        assert len(messages) > 0
        for msg in messages:
            assert msg.agent == AgentType.REPAIR_ADVISOR
