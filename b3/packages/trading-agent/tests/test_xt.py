from __future__ import annotations

import os
from unittest.mock import patch

import pytest

from trading_agent.xt_service import (
    XtConfirmRequired,
    XtWriteForbidden,
    assert_write_allowed,
)
from trading_agent.xt_spot import XtSpot


def test_spot_hmac_sign_uppercase_hex():
    client = XtSpot(access_key="test_ak", secret_key="test_sk", host="https://example.com")
    headers = client._auth_headers("/v4/balance", "GET", params={"currency": "usdt"})
    sig = headers["xt-validate-signature"]
    assert isinstance(sig, str)
    assert sig == sig.upper()
    assert len(sig) == 64


def test_assert_write_blocked_when_disabled():
    with patch.dict(os.environ, {"XT_TRADING_ENABLED": "0", "XT_PAPER_MODE": "0"}, clear=False):
        with pytest.raises(XtWriteForbidden):
            assert_write_allowed(confirm=True)


def test_assert_write_blocked_in_paper_mode():
    with patch.dict(os.environ, {"XT_TRADING_ENABLED": "1", "XT_PAPER_MODE": "1"}, clear=False):
        with pytest.raises(XtWriteForbidden):
            assert_write_allowed(confirm=True)


def test_assert_write_requires_confirm():
    with patch.dict(os.environ, {"XT_TRADING_ENABLED": "1", "XT_PAPER_MODE": "0"}, clear=False):
        with pytest.raises(XtConfirmRequired):
            assert_write_allowed(confirm=False)


def test_assert_withdraw_requires_ack():
    with patch.dict(os.environ, {"XT_TRADING_ENABLED": "1", "XT_PAPER_MODE": "0"}, clear=False):
        with pytest.raises(XtConfirmRequired):
            assert_write_allowed(confirm=True, irreversible=True, ack_irreversible=False)


def test_assert_write_ok_when_enabled():
    with patch.dict(os.environ, {"XT_TRADING_ENABLED": "1", "XT_PAPER_MODE": "0"}, clear=False):
        assert_write_allowed(confirm=True)
        assert_write_allowed(confirm=True, irreversible=True, ack_irreversible=True)
