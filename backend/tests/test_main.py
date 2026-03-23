import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)


def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_push_success():
    mock_workout_id = '123456789'
    with patch('main.push_workout', return_value={'workoutId': mock_workout_id}):
        response = client.post('/push', json={
            'garminEmail': 'test@example.com',
            'garminPassword': 'secret',
            'workout': {
                'name': 'Test',
                'segments': [
                    {'type': 'interval', 'durationType': 'time', 'duration': 300, 'repeat': 3}
                ]
            }
        })
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_push_invalid_credentials():
    from garminconnect import GarminConnectAuthenticationError
    with patch('main.push_workout', side_effect=GarminConnectAuthenticationError('bad creds')):
        response = client.post('/push', json={
            'garminEmail': 'bad@example.com',
            'garminPassword': 'wrong',
            'workout': {'name': 'Test', 'segments': []}
        })
    assert response.status_code == 401


def test_push_connection_error():
    from garminconnect import GarminConnectConnectionError
    with patch('main.push_workout', side_effect=GarminConnectConnectionError('timeout')):
        response = client.post('/push', json={
            'garminEmail': 'test@example.com',
            'garminPassword': 'secret',
            'workout': {'name': 'Test', 'segments': []}
        })
    assert response.status_code == 503


def test_push_missing_fields():
    response = client.post('/push', json={'garminEmail': 'x@x.com'})
    assert response.status_code == 422
