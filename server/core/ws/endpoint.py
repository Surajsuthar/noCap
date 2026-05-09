
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from dependencies import CurrentUser

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    user: CurrentUser,
    ws: WebSocket
):
    try:
        await ws.accept()
        while True:
            data = json.loads(ws.receive_text())

    except WebSocketDisconnect:
        pass
