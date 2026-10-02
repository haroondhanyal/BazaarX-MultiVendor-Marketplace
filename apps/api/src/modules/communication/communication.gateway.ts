import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/chat", cors: { origin: true } })
export class CommunicationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    client.emit("chat:connected", { connected: true });
  }

  handleDisconnect() {}

  @SubscribeMessage("conversation:join")
  joinConversation(client: Socket, payload: { conversationId?: string }) {
    if (payload?.conversationId) client.join(this.room(payload.conversationId));
  }

  @SubscribeMessage("conversation:leave")
  leaveConversation(client: Socket, payload: { conversationId?: string }) {
    if (payload?.conversationId) client.leave(this.room(payload.conversationId));
  }

  message(conversationId: string, data: unknown) {
    this.server
      .to(this.room(conversationId))
      .emit("message:new", { conversationId, message: data });
  }

  typing(conversationId: string, data: unknown) {
    this.server.to(this.room(conversationId)).emit("conversation:typing", data);
  }

  read(conversationId: string, data: unknown) {
    this.server.to(this.room(conversationId)).emit("message:read", data);
  }

  private room(id: string) {
    return `conversation:${id}`;
  }
}
