"""
Wusul SDK - Official Python SDK for Wusul Digital Access Control Platform.

Example:
    >>> from wusul import Wusul
    >>> client = Wusul(account_id, shared_secret)
    >>> access_pass = client.access_passes.issue({...})
"""

__version__ = "1.0.0"

from .auth import create_signature, encode_payload, verify_signature
from .client import Wusul
from .resources import AccessPasses, Console
from .types import (
    AccessPass,
    AccessPassState,
    AccountTier,
    CardTemplate,
    CardTemplateDesign,
    Classification,
    CreateCardTemplateParams,
    EventLogEntry,
    EventLogFilters,
    IssueAccessPassParams,
    ListAccessPassesParams,
    Platform,
    Protocol,
    ReadEventLogParams,
    SupportInfo,
    UpdateAccessPassParams,
    UpdateCardTemplateParams,
    WusulConfig,
    WusulResponse,
)

__all__ = [
    # Main client
    "Wusul",
    # Resources
    "AccessPasses",
    "Console",
    # Types
    "WusulConfig",
    "WusulResponse",
    "AccessPass",
    "AccessPassState",
    "IssueAccessPassParams",
    "UpdateAccessPassParams",
    "ListAccessPassesParams",
    "CardTemplate",
    "CreateCardTemplateParams",
    "UpdateCardTemplateParams",
    "CardTemplateDesign",
    "SupportInfo",
    "EventLogEntry",
    "EventLogFilters",
    "ReadEventLogParams",
    "Platform",
    "Protocol",
    "Classification",
    "AccountTier",
    # Auth utilities
    "encode_payload",
    "create_signature",
    "verify_signature",
]
