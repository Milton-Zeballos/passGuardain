from channels.generic.websocket import AsyncJsonWebsocketConsumer


class PingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send_json(
            {
                "type": "connection_established",
                "message": "WebSocket conectado correctamente.",
            }
        )

    async def receive_json(self, content, **kwargs):
        message = content.get("message", "")
        await self.send_json(
            {
                "type": "pong",
                "echo": message,
            }
        )
