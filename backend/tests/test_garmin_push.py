import pytest
from garmin_push import segments_to_steps, build_garmin_workout

def test_warmup_lap():
    segments = [{'type': 'warmup', 'durationType': 'lap'}]
    steps = segments_to_steps(segments)
    assert len(steps) == 1
    assert steps[0]['stepType']['stepTypeKey'] == 'warmup'
    assert steps[0]['endCondition']['conditionTypeKey'] == 'lap.button'
    assert steps[0]['endConditionValue'] is None

def test_cooldown_time():
    segments = [{'type': 'cooldown', 'durationType': 'time', 'duration': 600}]
    steps = segments_to_steps(segments)
    assert steps[0]['stepType']['stepTypeKey'] == 'cooldown'
    assert steps[0]['endCondition']['conditionTypeKey'] == 'time'
    assert steps[0]['endConditionValue'] == 600

def test_interval_with_rest_becomes_repeat_group():
    segments = [
        {'type': 'interval', 'durationType': 'time', 'duration': 360, 'repeat': 6},
        {'type': 'rest', 'durationType': 'time', 'duration': 60},
    ]
    steps = segments_to_steps(segments)
    assert len(steps) == 1  # one repeat group
    assert steps[0]['stepType']['stepTypeKey'] == 'repeat'
    assert steps[0]['endConditionValue'] == 6
    child_steps = steps[0]['workoutSteps']
    assert len(child_steps) == 2
    assert child_steps[0]['stepType']['stepTypeKey'] == 'interval'
    assert child_steps[1]['stepType']['stepTypeKey'] == 'recovery'

def test_interval_without_rest():
    segments = [
        {'type': 'interval', 'durationType': 'time', 'duration': 360, 'repeat': 4},
    ]
    steps = segments_to_steps(segments)
    assert len(steps) == 1
    assert steps[0]['stepType']['stepTypeKey'] == 'repeat'
    assert len(steps[0]['workoutSteps']) == 1

def test_rest_after_cooldown_is_not_grouped():
    segments = [
        {'type': 'cooldown', 'durationType': 'time', 'duration': 300},
        {'type': 'rest', 'durationType': 'time', 'duration': 60},
    ]
    steps = segments_to_steps(segments)
    assert len(steps) == 2
    assert steps[0]['stepType']['stepTypeKey'] == 'cooldown'
    assert steps[1]['stepType']['stepTypeKey'] == 'recovery'

def test_interval_distance():
    segments = [
        {'type': 'interval', 'durationType': 'distance', 'duration': 1000, 'repeat': 5},
    ]
    steps = segments_to_steps(segments)
    child = steps[0]['workoutSteps'][0]
    assert child['endCondition']['conditionTypeKey'] == 'distance'
    assert child['endConditionValue'] == 1000

def test_hr_zone_target():
    segments = [
        {'type': 'interval', 'durationType': 'time', 'duration': 240, 'repeat': 1, 'hrZone': 4},
    ]
    steps = segments_to_steps(segments)
    child = steps[0]['workoutSteps'][0]
    assert child['targetType']['workoutTargetTypeKey'] == 'heart.rate.zone'

def test_full_workout_structure():
    workout = {
        'name': '6x6 min',
        'segments': [
            {'type': 'warmup', 'durationType': 'lap'},
            {'type': 'interval', 'durationType': 'time', 'duration': 360, 'repeat': 6},
            {'type': 'rest', 'durationType': 'time', 'duration': 60},
            {'type': 'cooldown', 'durationType': 'lap'},
        ]
    }
    payload = build_garmin_workout(workout)
    assert payload['workoutName'] == '6x6 min'
    assert payload['sportType']['sportTypeKey'] == 'running'
    steps = payload['workoutSegments'][0]['workoutSteps']
    assert len(steps) == 3  # warmup, repeat-group, cooldown
