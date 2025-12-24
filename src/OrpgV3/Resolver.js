export class Resolver {
  #itemsIndex;

  constructor(chat) {
    this.chat = chat;
    this.#itemsIndex = new Map(Object.entries(chat.items));
  }

  getItem(itemId) {
    const item = this.#itemsIndex.get(itemId);
    if (!item) {
      console.warn(`Item not found: ${itemId}`);
      return null;
    }
    return item;
  }

  resolveMessageContent(message) {
    const resolvedItems = message.items
      .map((ref) => this.getItem(ref.id))
      .filter(Boolean);

    return {
      message,
      items: resolvedItems,
      textContent: this.#extractTextFromItems(resolvedItems),
      reasoningContent: this.#extractReasoningFromItems(resolvedItems),
    };
  }

  #extractTextFromItems(items) {
    return items
      .filter((item) => item.data?.type === "message")
      .flatMap((item) => item.data.content || [])
      .filter((c) => c.type === "input_text" || c.type === "output_text")
      .map((c) => c.text)
      .join("");
  }

  #extractReasoningFromItems(items) {
    return items
      .filter((item) => item.data?.type === "reasoning")
      .flatMap((item) => item.data.content || [])
      .map((c) => c.text)
      .join("");
  }

  getOrderedMessages() {
    const messages = Object.values(this.chat.messages);

    const root = messages.find((m) => !m.parentMessageId);
    if (!root) {
      return messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    const childrenMap = new Map();
    for (const msg of messages) {
      if (msg.parentMessageId) {
        const children = childrenMap.get(msg.parentMessageId) || [];
        children.push(msg);
        childrenMap.set(msg.parentMessageId, children);
      }
    }

    const ordered = [];
    const queue = [root];

    while (queue.length > 0) {
      const current = queue.shift();
      ordered.push(current);

      const children = childrenMap.get(current.id) || [];
      children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      queue.push(...children);
    }

    return ordered;
  }
}
