"""
Property-based tests for HistorianAgent date extraction.

Feature: code-quality-validation, Property 11: Date Extraction
Validates: Requirements 4.2
"""
import pytest
from hypothesis import given, settings, strategies as st
import re

# Import from main.py
import sys
sys.path.insert(0, '.')
from main import HistorianAgent

# Import generators
from tests.generators import arbitrary_text_with_dates


# =============================================================================
# PROPERTY 11: DATE EXTRACTION
# =============================================================================

@given(text=arbitrary_text_with_dates())
@settings(max_examples=100)
def test_property_date_extraction(text):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any text containing dates in the format YYYY (1880-1929),
    the Historian should extract those dates using regex patterns.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    # The text was generated with dates, so we should find at least one
    assert len(dates) > 0, f"Should extract at least one date from text: {text[:100]}"
    
    # All extracted dates should be strings
    for date in dates:
        assert isinstance(date, str), f"Date should be a string: {date}"
    
    # All extracted dates should be present in the original text
    for date in dates:
        assert date in text, f"Extracted date '{date}' should be in text"


@given(year=st.integers(min_value=1880, max_value=1929))
@settings(max_examples=100)
def test_property_single_year_extraction(year):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any year in the range 1880-1929 embedded in text,
    the Historian should extract that year.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with the year
    text = f"This event occurred in {year} during the colonial period."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    year_str = str(year)
    assert year_str in dates, f"Should extract year {year_str} from text"


@given(
    years=st.lists(
        st.integers(min_value=1880, max_value=1929),
        min_size=2,
        max_size=5,
        unique=True
    )
)
@settings(max_examples=100)
def test_property_multiple_year_extraction(years):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any text containing multiple years in the range 1880-1929,
    the Historian should extract all of them.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with all years
    text = "Events occurred in " + ", ".join(str(y) for y in years) + " respectively."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    for year in years:
        year_str = str(year)
        assert year_str in dates, f"Should extract year {year_str} from multiple years"


@given(
    year=st.integers(min_value=1880, max_value=1929),
    repetitions=st.integers(min_value=1, max_value=5)
)
@settings(max_examples=100)
def test_property_repeated_year_extraction(year, repetitions):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any year mentioned multiple times in text,
    the Historian should extract it (possibly multiple times).
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with repeated year
    sentences = [f"In {year} something happened. " for _ in range(repetitions)]
    text = "".join(sentences)
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    year_str = str(year)
    # Should extract the year at least once
    assert year_str in dates, f"Should extract year {year_str}"
    
    # Count how many times the year appears in extracted dates
    year_count = dates.count(year_str)
    # Should extract it as many times as it appears in text
    assert year_count == repetitions, \
        f"Should extract year {year_str} {repetitions} times, found {year_count}"


@given(year=st.integers(min_value=1800, max_value=2000).filter(lambda y: y < 1880 or y > 1929))
@settings(max_examples=100)
def test_property_out_of_range_years_not_extracted(year):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any year outside the range 1880-1929,
    the Historian should NOT extract it.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with out-of-range year
    text = f"This event occurred in {year} which is outside the colonial period."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    year_str = str(year)
    assert year_str not in dates, \
        f"Should NOT extract year {year_str} (outside 1880-1929 range)"


@given(
    day=st.integers(min_value=1, max_value=31),
    month=st.sampled_from([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]),
    year=st.integers(min_value=1880, max_value=1929)
)
@settings(max_examples=100)
def test_property_full_date_format_extraction(day, month, year):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any full date in format "DD Month YYYY" within 1880-1929,
    the Historian should extract it.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with full date
    text = f"The treaty was signed on {day} {month} {year} in Bulawayo."
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    # Should extract either the full date or at least the year
    assert len(dates) > 0, f"Should extract date from '{day} {month} {year}'"
    
    # The year should definitely be extracted
    year_str = str(year)
    dates_str = ' '.join(dates)
    assert year_str in dates_str, f"Should extract year {year_str} from full date"


@given(text=st.text(min_size=0, max_size=500))
@settings(max_examples=100)
def test_property_date_extraction_returns_list(text):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any text, the _extract_dates method should always return
    a list (possibly empty).
    """
    # Arrange
    historian = HistorianAgent()
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    assert isinstance(dates, list), "Should return a list"
    
    # All elements should be strings
    for date in dates:
        assert isinstance(date, str), f"Date should be a string: {date}"


@given(
    year=st.integers(min_value=1880, max_value=1929),
    prefix=st.text(min_size=0, max_size=50),
    suffix=st.text(min_size=0, max_size=50)
)
@settings(max_examples=100)
def test_property_year_extraction_with_context(year, prefix, suffix):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any year in the range 1880-1929 with arbitrary text before/after,
    the Historian should extract the year regardless of context.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with year surrounded by arbitrary text
    text = f"{prefix} {year} {suffix}"
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    year_str = str(year)
    # Should extract the year regardless of surrounding text
    assert year_str in dates, \
        f"Should extract year {year_str} regardless of context"


@given(text=st.text(alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Zs')), min_size=10, max_size=200))
@settings(max_examples=100)
def test_property_no_dates_returns_empty_list(text):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any text containing no dates in the 1880-1929 range,
    the Historian should return an empty list or only extract dates that are actually present.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    # All extracted dates should be present in the text
    for date in dates:
        assert date in text, f"Extracted date '{date}' should be in text"


@given(
    year=st.integers(min_value=1880, max_value=1929),
    separator=st.sampled_from([' ', '-', '/', '.', ','])
)
@settings(max_examples=100)
def test_property_year_extraction_with_separators(year, separator):
    """
    Feature: code-quality-validation, Property 11: Date Extraction
    Validates: Requirements 4.2
    
    Property: For any year in the range 1880-1929 with various separators,
    the Historian should extract the year.
    """
    # Arrange
    historian = HistorianAgent()
    
    # Create text with year and separator
    text = f"Event{separator}{year}{separator}occurred"
    
    # Act
    dates = historian._extract_dates(text)
    
    # Assert
    year_str = str(year)
    assert year_str in dates, \
        f"Should extract year {year_str} with separator '{separator}'"
