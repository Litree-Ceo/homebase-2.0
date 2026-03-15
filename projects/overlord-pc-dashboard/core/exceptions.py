# core/exceptions.py
"""Custom exceptions for the Overlord Dashboard core module."""


class ConfigError(Exception):
    """Exception raised for configuration errors."""

    pass


class AuthenticationError(Exception):
    """Exception raised for authentication failures."""

    pass


class AuthorizationError(Exception):
    """Exception raised for authorization failures."""

    pass
