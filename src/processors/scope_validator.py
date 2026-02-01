# scope_validator.py
import logging
import pathlib
from pathlib import Path

class ScopeValidator:
    """
    Validates that a given scope (string) is allowed based on a scope file.

    Usage:
        validator = ScopeValidator(Path("data/scope.md"))
        if validator.validate_scope("Quantum Mechanics"):
            # process document
    """

    def __init__(self, scope_path: pathlib.Path) -> None:
        self.scope_path = scope_path
        self.logger = logging.getLogger(__name__)
        self.allowed_scopes = self._load_allowed_scopes()
        self.logger.info(f"Loaded {len(self.allowed_scopes)} allowed scopes.")

    def _load_allowed_scopes(self) -> set:
        """
        Reads the scope file and returns a set of allowed scopes.
        """
        try:
            with open(self.scope_path, "r", encoding="utf-8") as f:
                scopes = f.read().splitlines()
            # Remove empty lines and strip whitespace
            scopes = [s.strip() for s in scopes if s.strip()]
            return set(scopes)
        except FileNotFoundError:
            self.logger.error(f"Scope file not found: {self.scope_path}")
            return set()
        except Exception as e:
            self.logger.error(f"Error reading scope file: {e}")
            return set()

    def validate_scope(self, scope: str) -> bool:
        """
        Returns True if the given scope string is in the allowed scopes.
        Case-insensitive check.
        """
        if not scope:
            return False
        return scope.strip().lower() in (s.lower() for s in self.allowed_scopes)

