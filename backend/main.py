from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from garminconnect import GarminConnectAuthenticationError, GarminConnectConnectionError
from garmin_push import push_workout

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


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/push')
def push(req: PushRequest):
    try:
        result = push_workout(req.garminEmail, req.garminPassword, req.workout)
        return {'status': 'ok', 'garminWorkoutId': str(result.get('workoutId', ''))}
    except GarminConnectAuthenticationError:
        raise HTTPException(status_code=401, detail='Invalid Garmin credentials')
    except GarminConnectConnectionError as e:
        raise HTTPException(status_code=503, detail=f'Garmin Connect unavailable: {e}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
