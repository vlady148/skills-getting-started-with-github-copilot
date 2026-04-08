from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

from src.app import activities, app

INITIAL_ACTIVITIES = deepcopy(activities)


@pytest.fixture(autouse=True)
def reset_activities_state():
    """Ensure in-memory activity data is reset between tests."""
    # Arrange
    activities.clear()
    activities.update(deepcopy(INITIAL_ACTIVITIES))

    yield

    # Assert-like cleanup to keep tests isolated regardless of failures
    activities.clear()
    activities.update(deepcopy(INITIAL_ACTIVITIES))


@pytest.fixture()
def client():
    # Arrange
    with TestClient(app) as test_client:
        # Act
        yield test_client
        # Assert
