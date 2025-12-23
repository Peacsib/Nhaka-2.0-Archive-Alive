"""
Test to verify pytest setup is working correctly.
"""
import pytest


@pytest.mark.unit
def test_pytest_working():
    """Verify pytest is installed and working."""
    assert True


@pytest.mark.unit
def test_hypothesis_import():
    """Verify Hypothesis is installed and can be imported."""
    from hypothesis import given, strategies as st
    assert given is not None
    assert st is not None


@pytest.mark.unit
@pytest.mark.asyncio
async def test_asyncio_support():
    """Verify pytest-asyncio is working."""
    async def async_function():
        return 42
    
    result = await async_function()
    assert result == 42
