"""
Property-based tests for HistorianAgent figure detection.

Feature: code-quality-validation, Property 10: Historical Figure Detection
Validates: Requirements 4.1
"""
import pytest
from hypothesis import given, settings, strategies as st

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import HistorianAgent

# Import generators
from tests.generators import arbitrary_text_with_historical_figures, HISTORICAL_FIGURES


# =============================================================================
# PROPERTY 10: HISTORICAL FIGURE DETECTION
# =============================================================================

@given(text=arbitrary_text_with_historical_figures())
@settings(max_examples=100)
def test_property_historical_figure_detection(text):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any text containing a name from the KEY_FIGURES database,
    the Historian should detect that figure and include it in the findings.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    # The text was generated with historical figures, so we should find at least one
    assert len(figures_found) > 0, f"Should detect at least one historical figure in text: {text[:100]}"
    
    # Verify that all detected figures are actually in the text (case-insensitive)
    text_lower = text.lower()
    for figure_name in figures_found.keys():
        assert figure_name.lower() in text_lower, f"Detected figure '{figure_name}' should be in text"
    
    # Verify that detected figures are from the KEY_FIGURES database
    for figure_name in figures_found.keys():
        assert figure_name in historian.KEY_FIGURES, f"Detected figure '{figure_name}' should be in KEY_FIGURES"
    
    # Verify that the role/description is provided
    for figure_name, role in figures_found.items():
        assert role is not None, f"Figure '{figure_name}' should have a role"
        assert len(role) > 0, f"Figure '{figure_name}' should have a non-empty role"
        assert role == historian.KEY_FIGURES[figure_name], f"Role should match KEY_FIGURES database"


@given(text=st.text(min_size=10, max_size=500))
@settings(max_examples=100)
def test_property_figure_detection_no_false_positives(text):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any text, all detected figures should actually be present in the text
    (no false positives).
    """
    # Arrange
    historian = HistorianAgent()
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    # All detected figures must be in the text (case-insensitive)
    text_lower = text.lower()
    for figure_name in figures_found.keys():
        assert figure_name.lower() in text_lower, \
            f"Detected figure '{figure_name}' must be present in text: {text[:100]}"


@given(figure=st.sampled_from(HISTORICAL_FIGURES))
@settings(max_examples=100)
def test_property_single_figure_detection(figure):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any single historical figure name embedded in text,
    the Historian should detect that specific figure.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with the figure name
    text = f"This document mentions {figure} in the context of colonial history."
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    assert figure in figures_found, f"Should detect {figure} in text"
    assert figures_found[figure] == historian.KEY_FIGURES[figure], \
        f"Should return correct role for {figure}"


@given(
    figure=st.sampled_from(HISTORICAL_FIGURES),
    case_variant=st.sampled_from(['lower', 'upper', 'title', 'mixed'])
)
@settings(max_examples=100)
def test_property_figure_detection_case_insensitive(figure, case_variant):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any historical figure name in any case variation,
    the Historian should detect it (case-insensitive detection).
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create case variant
    if case_variant == 'lower':
        figure_variant = figure.lower()
    elif case_variant == 'upper':
        figure_variant = figure.upper()
    elif case_variant == 'title':
        figure_variant = figure.title()
    else:  # mixed
        figure_variant = ''.join(
            c.upper() if i % 2 == 0 else c.lower()
            for i, c in enumerate(figure)
        )
    
    text = f"This document mentions {figure_variant} in the records."
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    assert figure in figures_found, \
        f"Should detect {figure} regardless of case (variant: {figure_variant})"


@given(
    figures=st.lists(
        st.sampled_from(HISTORICAL_FIGURES),
        min_size=2,
        max_size=5,
        unique=True
    )
)
@settings(max_examples=100)
def test_property_multiple_figure_detection(figures):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any text containing multiple historical figures,
    the Historian should detect all of them.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with all figures
    text = "This document discusses " + ", ".join(figures) + " and their roles."
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    for figure in figures:
        assert figure in figures_found, f"Should detect {figure} among multiple figures"
    
    # Should detect exactly the figures we put in (no more, no less)
    assert len(figures_found) == len(figures), \
        f"Should detect exactly {len(figures)} figures, found {len(figures_found)}"


@given(
    figure=st.sampled_from(HISTORICAL_FIGURES),
    repetitions=st.integers(min_value=1, max_value=10)
)
@settings(max_examples=100)
def test_property_figure_detection_with_repetitions(figure, repetitions):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any historical figure mentioned multiple times in text,
    the Historian should detect it once (no duplicate detections).
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with repeated figure mentions
    sentences = [f"{figure} did something. " for _ in range(repetitions)]
    text = "".join(sentences)
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    assert figure in figures_found, f"Should detect {figure}"
    
    # Should only appear once in the results (no duplicates)
    assert len(figures_found) == 1, \
        f"Should detect {figure} only once despite {repetitions} mentions"


@given(text=st.text(min_size=0, max_size=500))
@settings(max_examples=100)
def test_property_figure_detection_returns_dict(text):
    """
    Feature: code-quality-validation, Property 10: Historical Figure Detection
    Validates: Requirements 4.1
    
    Property: For any text, the _detect_figures method should always return
    a dictionary (possibly empty).
    """
    # Arrange
    historian = HistorianAgent()
    
    # Act
    figures_found = historian._detect_figures(text)
    
    # Assert
    assert isinstance(figures_found, dict), "Should return a dictionary"
    
    # All keys should be strings (figure names)
    for key in figures_found.keys():
        assert isinstance(key, str), "Figure names should be strings"
    
    # All values should be strings (roles/descriptions)
    for value in figures_found.values():
        assert isinstance(value, str), "Figure roles should be strings"
        assert len(value) > 0, "Figure roles should be non-empty"
