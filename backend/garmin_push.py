import uuid
from garminconnect import Garmin

_sessions: dict = {}


class MFARequired(Exception):
    def __init__(self, session_id: str):
        self.session_id = session_id

STEP_TYPE_MAP = {
    'warmup':   {'stepTypeId': 1, 'stepTypeKey': 'warmup'},
    'cooldown': {'stepTypeId': 2, 'stepTypeKey': 'cooldown'},
    'interval': {'stepTypeId': 3, 'stepTypeKey': 'interval'},
    'rest':     {'stepTypeId': 4, 'stepTypeKey': 'recovery'},
}

NO_TARGET = {'workoutTargetTypeId': 1, 'workoutTargetTypeKey': 'no.target'}


def _end_condition(segment):
    dtype = segment.get('durationType')
    if dtype == 'lap':
        return {'conditionTypeKey': 'lap.button', 'conditionTypeId': 1}, None
    elif dtype == 'time':
        return {'conditionTypeKey': 'time', 'conditionTypeId': 2}, segment['duration']
    elif dtype == 'distance':
        return {'conditionTypeKey': 'distance', 'conditionTypeId': 3}, segment['duration']
    raise ValueError(f"Unknown durationType: {dtype}")


def _target(segment):
    if segment.get('hrZone'):
        return {
            'workoutTargetTypeId': 4,
            'workoutTargetTypeKey': 'heart.rate.zone',
            'targetValueOne': segment['hrZone'],
            'targetValueTwo': segment['hrZone'],
        }
    return NO_TARGET


def _single_step(segment, order):
    end_cond, end_val = _end_condition(segment)
    return {
        'stepOrder': order,
        'stepType': STEP_TYPE_MAP[segment['type']],
        'endCondition': end_cond,
        'endConditionValue': end_val,
        'targetType': _target(segment),
    }


def segments_to_steps(segments):
    steps = []
    step_order = 1
    i = 0
    while i < len(segments):
        seg = segments[i]
        if seg['type'] == 'interval':
            repeat = seg.get('repeat', 1)
            child_steps = [_single_step(seg, 1)]
            # Consume adjacent rest (immediately next segment)
            if i + 1 < len(segments) and segments[i + 1]['type'] == 'rest':
                child_steps.append(_single_step(segments[i + 1], 2))
                i += 1
            steps.append({
                'stepOrder': step_order,
                'stepType': {'stepTypeId': 6, 'stepTypeKey': 'repeat'},
                'endCondition': {'conditionTypeKey': 'iterations', 'conditionTypeId': 7},
                'endConditionValue': repeat,
                'childStepId': 1,
                'workoutSteps': child_steps,
            })
        else:
            steps.append(_single_step(seg, step_order))
        step_order += 1
        i += 1
    return steps


def build_garmin_workout(workout):
    steps = segments_to_steps(workout['segments'])
    return {
        'sportType': {'sportTypeId': 1, 'sportTypeKey': 'running'},
        'workoutName': workout['name'],
        'workoutSegments': [{
            'segmentOrder': 1,
            'sportType': {'sportTypeId': 1, 'sportTypeKey': 'running'},
            'workoutSteps': steps,
        }],
    }


def push_workout(
    email: str,
    password: str,
    workout: dict,
    *,
    mfa_code: str | None = None,
    session_id: str | None = None,
) -> dict:
    if session_id and mfa_code:
        session = _sessions.pop(session_id, None)
        if session is None:
            raise ValueError('Session utløpt — prøv igjen.')
        client = session['client']
        workout = session['workout']
        client.garth.resume_login(otp_code=mfa_code)
    else:
        class _MFANeeded(Exception):
            pass

        def _prompt_mfa():
            raise _MFANeeded()

        client = Garmin(email, password, prompt_mfa=_prompt_mfa)
        try:
            client.login()
        except _MFANeeded:
            sid = str(uuid.uuid4())
            _sessions[sid] = {'client': client, 'workout': workout}
            raise MFARequired(sid)

    payload = build_garmin_workout(workout)
    result = client.add_workout(payload)
    return result
