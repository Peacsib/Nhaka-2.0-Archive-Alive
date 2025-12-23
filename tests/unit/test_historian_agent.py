"""
Unit tests for HistorianAgent.
Tests specific examples, edge cases, and error conditions.

Requirements: 4.3
"""
import pytest
import asyncio
from datetime import datetime

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import HistorianAgent, AgentType


# =============================================================================
# UNIT TESTS - SPECIFIC EXAMPLES
# =============================================================================

@pytest.mark.asyncio
async def test_historian_with_rudd_and_lobengula_names():
    """
    Test Historian with Rudd and Lobengula names (example).
    
    Requirements: 4.3
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "This document concerns Charles Rudd and King Lobengula regarding the mining concession of 1888.",
        "transliterated_text": "This document concerns Charles Rudd and King Lobengula regarding the mining concession of 1888.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that both figures are detected
    figure_messages = [m for m in messages if "KEY FIGURES" in m.message]
    assert len(figure_messages) > 0, "Should detect key figures"
    
    # Check that Rudd-Lobengula connection is verified
    verification_messages = [m for m in messages if "Rudd-Lobengula" in m.message or "CROSS-VERIFIED" in m.message]
    assert len(verification_messages) > 0, "Should verify Rudd-Lobengula connection"
    
    # Check context is populated
    assert "verified_facts" in context, "Should populate verified_facts"
    assert len(context["verified_facts"]) > 0, "Should have verified facts"
    
    # Check that the Rudd Concession context is mentioned
    verified_text = ' '.join(context["verified_facts"])
    assert "Rudd" in verified_text or "treaty" in verified_text.lower(), "Should mention Rudd or treaty context"


@pytest.mark.asyncio
async def test_historian_with_various_date_formats():
    """
    Test Historian with various date formats.
    
    Requirements: 4.3
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "The treaty was signed in 1888. Another event occurred on 30 October 1889. The year 1893 was significant.",
        "transliterated_text": "The treaty was signed in 1888. Another event occurred on 30 October 1889. The year 1893 was significant.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that date analysis is performed
    date_messages = [m for m in messages if "temporal" in m.message.lower() or "date" in m.message.lower() or "1888" in m.message]
    assert len(date_messages) > 0, "Should analyze dates"
    
    # Check context is populated
    assert "verified_facts" in context, "Should populate verified_facts"


@pytest.mark.asyncio
async def test_historian_with_no_historical_figures():
    """
    Test Historian with no historical figures.
    
    Requirements: 4.3
    """
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "This is a modern document with no historical figures or dates from the colonial period.",
        "transliterated_text": "This is a modern document with no historical figures or dates from the colonial period.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit at least one message"
    
    # Check that completion message is present
    completion_messages = [m for m in messages if "COMPLETE" in m.message]
    assert len(completion_messages) > 0, "Should emit completion message"
    
    # Check context is populated (even if empty)
    assert "verified_facts" in context, "Should populate verified_facts"
    assert "historian_findings" in context, "Should populate historian_findings"


# =============================================================================
# UNIT TESTS - EDGE CASES
# =============================================================================

@pytest.mark.asyncio
async def test_historian_with_empty_text():
    """Test Historian with empty text."""
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "",
        "transliterated_text": "",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should emit messages even with empty text"
    assert "verified_facts" in context
    assert "historian_findings" in context


@pytest.mark.asyncio
async def test_historian_with_only_dates_no_figures():
    """Test Historian with dates but no historical figures."""
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "The year 1888 was important. Also 1893 and 1896.",
        "transliterated_text": "The year 1888 was important. Also 1893 and 1896.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0
    
    # Should still analyze dates
    date_messages = [m for m in messages if "1888" in m.message or "temporal" in m.message.lower()]
    assert len(date_messages) > 0, "Should analyze dates even without figures"


@pytest.mark.asyncio
async def test_historian_with_only_figures_no_dates():
    """Test Historian with historical figures but no dates."""
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "Lobengula and Rhodes met with Jameson to discuss matters.",
        "transliterated_text": "Lobengula and Rhodes met with Jameson to discuss matters.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0
    
    # Should detect figures
    figure_messages = [m for m in messages if "KEY FIGURES" in m.message or "Lobengula" in m.message]
    assert len(figure_messages) > 0, "Should detect figures even without dates"


@pytest.mark.asyncio
async def test_historian_with_multiple_same_figure():
    """Test Historian with multiple mentions of the same figure."""
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "Lobengula said this. Lobengula also said that. Lobengula finally agreed.",
        "transliterated_text": "Lobengula said this. Lobengula also said that. Lobengula finally agreed.",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0
    
    # Should detect Lobengula (but only count once)
    figure_messages = [m for m in messages if "KEY FIGURES" in m.message]
    assert len(figure_messages) > 0, "Should detect Lobengula"


# =============================================================================
# UNIT TESTS - HELPER METHODS
# =============================================================================

def test_detect_figures_method():
    """Test the _detect_figures method directly."""
    # Arrange
    historian = HistorianAgent()
    text = "Charles Rudd met with Lobengula and Rhodes to discuss the concession."
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    assert len(figures_found) > 0, "Should find figures"
    assert "Rudd" in figures_found, "Should find Rudd"
    assert "Lobengula" in figures_found, "Should find Lobengula"
    assert "Rhodes" in figures_found, "Should find Rhodes"


def test_detect_figures_case_insensitive():
    """Test that figure detection is case-insensitive."""
    # Arrange
    historian = HistorianAgent()
    text = "lobengula and RUDD and rhodes"
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    assert len(figures_found) >= 2, "Should find figures regardless of case"


def test_extract_dates_method():
    """Test the _extract_dates method directly."""
    # Arrange
    historian = HistorianAgent()
    text = "The treaty was signed in 1888. The war started in 1893. Another event in 1896."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    assert len(dates) > 0, "Should extract dates"
    assert "1888" in dates, "Should extract 1888"
    assert "1893" in dates, "Should extract 1893"
    assert "1896" in dates, "Should extract 1896"


def test_extract_dates_with_full_format():
    """Test date extraction with full date format."""
    # Arrange
    historian = HistorianAgent()
    text = "Signed on 30 October 1888 in Bulawayo."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    assert len(dates) > 0, "Should extract dates"
    # Should extract either the full date or the year
    assert any("1888" in d for d in dates), "Should extract 1888"


def test_extract_dates_outside_range():
    """Test that dates outside 1880-1929 range are not extracted."""
    # Arrange
    historian = HistorianAgent()
    text = "The year 1850 was early. The year 1950 was late. But 1888 was right."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    # Should only extract 1888 (within range)
    assert "1888" in dates, "Should extract 1888"
    # 1850 and 1950 should not be extracted (outside range)
    assert "1850" not in dates, "Should not extract 1850"
    assert "1950" not in dates, "Should not extract 1950"


def test_verify_historical_context_method():
    """Test the _verify_historical_context method directly."""
    # Arrange
    historian = HistorianAgent()
    text = "Rudd and Lobengula signed the concession in 1888."
    figures = {"Rudd": "Charles Rudd - Rhodes' representative", "Lobengula": "Last King of the Ndebele"}
    dates = ["1888"]
    
    # Act
    verifications = historian._verify_historical_context(text, figures, dates)
    
    # Assert
    assert len(verifications) > 0, "Should generate verifications"
    
    # Should verify Rudd-Lobengula connection
    rudd_lobengula_verifications = [v for v in verifications if "Rudd-Lobengula" in v["message"]]
    assert len(rudd_lobengula_verifications) > 0, "Should verify Rudd-Lobengula connection"


# =============================================================================
# UNIT TESTS - CONTEXT POPULATION
# =============================================================================

@pytest.mark.asyncio
async def test_historian_populates_all_required_context_fields():
    """Test that Historian populates all required context fields."""
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "Lobengula and Rudd in 1888",
        "transliterated_text": "Lobengula and Rudd in 1888",
        "start_time": datetime.utcnow()
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert - Check all required fields are populated
    assert "historian_findings" in context, "Should populate historian_findings"
    assert "verified_facts" in context, "Should populate verified_facts"
    assert "historical_anomalies" in context, "Should populate historical_anomalies"
    
    # Verify types
    assert isinstance(context["historian_findings"], list)
    assert isinstance(context["verified_facts"], list)
    assert isinstance(context["historical_anomalies"], list)


@pytest.mark.asyncio
async def test_historian_agent_type_and_metadata():
    """Test that Historian has correct agent type and metadata."""
    # Arrange
    historian = HistorianAgent()
    
    # Assert
    assert historian.agent_type == AgentType.HISTORIAN
    assert historian.name == "Historian"
    assert "1888" in historian.description or "colonial" in historian.description.lower()
    
    # Check historical database exists
    assert hasattr(historian, 'HISTORICAL_DATABASE')
    assert len(historian.HISTORICAL_DATABASE) > 0
    
    # Check key figures exist
    assert hasattr(historian, 'KEY_FIGURES')
    assert len(historian.KEY_FIGURES) > 0
    
    # Verify specific figures are in the database
    assert "Lobengula" in historian.KEY_FIGURES
    assert "Rudd" in historian.KEY_FIGURES
    assert "Rhodes" in historian.KEY_FIGURES


@pytest.mark.asyncio
async def test_historian_handles_missing_transliterated_text():
    """Test that Historian handles missing transliterated_text gracefully."""
    # Arrange
    historian = HistorianAgent()
    context = {
        "raw_text": "Lobengula and Rudd in 1888",
        "start_time": datetime.utcnow()
        # Note: no transliterated_text
    }
    
    # Act
    messages = []
    async for msg in historian.process(context):
        messages.append(msg)
    
    # Assert
    assert len(messages) > 0, "Should handle missing transliterated_text"
    assert "verified_facts" in context, "Should still populate context"
