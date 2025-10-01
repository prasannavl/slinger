import { Message } from "../lib/types.ts";

interface MessageCardProps {
  message: Message;
}

export default function MessageCard({ message }: MessageCardProps) {
  return (
    <div class="message-card">
      <div class="message-content">
        {message.content}
      </div>
      <div class="message-timestamp">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}
