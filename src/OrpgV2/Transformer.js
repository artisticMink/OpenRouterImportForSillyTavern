export class Transformer {
  static transform(message, characterName, personaName) {
    const isUser = message.type === "user";

    return {
      name: isUser ? personaName : characterName,
      is_user: isUser,
      is_system: false,
      mes: message.content,
      extra: message.reasoning ? { reasoning: message.reasoning } : {},
      swipes: [message.content],
      swipe_id: 0,
      swipe_info: [
        {
          send_date: message.createdAt || "",
          extra: {},
        },
      ],
    };
  }
}
