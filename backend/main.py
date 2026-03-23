from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from garminconnect import GarminConnectAuthenticationError, GarminConnectConnectionError
from garmin_push import push_workout, MFARequired

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


class PushRequest(BaseModel):
    garminEmail: str
    garminPassword: str
    workout: dict[str, Any]
    mfaCode: str | None = None
    sessionId: str | None = None


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/push')
def push(req: PushRequest):
    try:
        result = push_workout(
            req.garminEmail, req.garminPassword, req.workout,
            mfa_code=req.mfaCode, session_id=req.sessionId,
        )
        return {'status': 'ok', 'garminWorkoutId': str(result.get('workoutId', ''))}
    except MFARequired as e:
        return {'status': 'mfa_required', 'sessionId': e.session_id}
    except GarminConnectAuthenticationError:
        raise HTTPException(status_code=401, detail='Invalid Garmin credentials')
    except GarminConnectConnectionError as e:
        raise HTTPException(status_code=503, detail=f'Garmin Connect unavailable: {e}')
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
