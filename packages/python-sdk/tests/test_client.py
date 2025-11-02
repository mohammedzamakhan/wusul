"""Tests for main client module."""
import pytest

from wusul import Wusul
from wusul.resources import AccessPasses, Console


class TestWusul:
    """Test Wusul client."""

    def test_initialization(self):
        """Test client initialization."""
        client = Wusul("test_account", "test_secret")

        assert client.access_passes is not None
        assert client.console is not None
        assert isinstance(client.access_passes, AccessPasses)
        assert isinstance(client.console, Console)

    def test_initialization_with_options(self):
        """Test client initialization with custom options."""
        client = Wusul(
            "test_account", "test_secret", base_url="https://custom.api.com", timeout=60000
        )

        assert client._http.base_url == "https://custom.api.com"
        assert client._http.timeout == 60.0  # Converted to seconds

    def test_initialization_missing_credentials(self):
        """Test client initialization with missing credentials."""
        with pytest.raises(ValueError, match="account_id and shared_secret are required"):
            Wusul("", "test_secret")

        with pytest.raises(ValueError, match="account_id and shared_secret are required"):
            Wusul("test_account", "")

    def test_default_base_url(self):
        """Test default base URL."""
        client = Wusul("test_account", "test_secret")
        assert client._http.base_url == "https://api.wusul.io"

    def test_default_timeout(self):
        """Test default timeout."""
        client = Wusul("test_account", "test_secret")
        assert client._http.timeout == 30.0  # 30000ms converted to 30s
