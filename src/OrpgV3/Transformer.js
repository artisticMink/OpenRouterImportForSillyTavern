export class Transformer {
  static transform(resolvedMessage, characterName, personaName) {
    const { message, textContent, reasoningContent } = resolvedMessage;
    const isUser = message.type === "user";

    return {
      name: isUser ? personaName : characterName,
      is_user: isUser,
      is_system: false,
      mes: textContent,
      extra: reasoningContent ? { reasoning: reasoningContent } : {},
      swipes: [textContent],
      swipe_id: 0,
      swipe_info: [
        {
          send_date: message.createdAt || "",
          extra: message.metadata || {},
        },
      ],
    };
  }
}
