"""Logging setup module for Overlord Dashboard.

Note: This is the legacy logging module. For new code, use core module instead.
The core/__init__.py provides setup_logging() and get_logger() functions
that include the same sanitization filters.

This module is kept for backward compatibility and delegates to the core module.
"""

import logging
import os
from typing import Any, Dict, Optional, Union

# Import from core module - the canonical implementation
try:
    from core import (
        SanitizingFilter,
        RequestContextFilter,
        get_logger,
        setup_logging as _core_setup_logging,
    )
    
    # Re-export for backward compatibility
    __all__ = [
        "SanitizingFilter",
        "RequestContextFilter",
        "get_logger",
        "setup_logging",
    ]
    
    def setup_logging(config: Optional[Dict[str, Any]] = None) -> logging.Logger:
        """Setup logging - delegates to core module."""
        return _core_setup_logging()
    
except ImportError:
    # Fallback if core not available - use basic logging
    # This should rarely happen in production
    def setup_logging(config: Optional[Dict[str, Any]] = None) -> logging.Logger:
        """Fallback logging setup if core module is not available."""
        logging.basicConfig(
            level=logging.INFO,
            format="[%(asctime)s] %(levelname)-8s %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        return logging.getLogger("overlord")
    
    def get_logger(name: Optional[str] = None) -> logging.Logger:
        """Fallback logger if core module is not available."""
        return logging.getLogger(name or "overlord")


# Legacy function for backward compatibility
def getLogger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger instance (legacy function).
    
    Note: This is deprecated. Use get_logger() instead.
    """
    return get_logger(name)
