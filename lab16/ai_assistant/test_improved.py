import pytest
from improved_code import validate_email, sort_dicts_by_key, measure_execution_time


def test_validate_email():
    assert validate_email("test@example.com") is True
    assert validate_email("user.name@domain.co.uk") is True
    assert validate_email("invalid-email") is False
    assert validate_email("@nodomain.com") is False
    assert validate_email("user@") is False


def test_sort_dicts_by_key():
    data = [{"score": 85}, {"score": 42}, {"score": 97}]
    sorted_data = sort_dicts_by_key(data, "score")
    assert sorted_data[0]["score"] == 42
    assert sorted_data[-1]["score"] == 97


def test_sort_descending():
    data = [{"value": 10}, {"value": 5}, {"value": 8}]
    result = sort_dicts_by_key(data, "value", descending=True)
    assert result[0]["value"] == 10


def test_empty_list():
    assert sort_dicts_by_key([], "key") == []
