/**
 * orpg 3.0 resolver
 * 
 * V3 seperates message information and content into the
 * messages and items nodes. This class resolves this relationship.
 */
export class Resolver {
  #itemsIndex;

  constructor(chat) {
    this.chat = chat;
    this.#itemsIndex = new Map(Object.entries(chat.items));
  }

  /**
   * Get a specific item from the index
   * 
   * @param {*} itemId 
   * @returns 
   */
  getItem(itemId) {
    const item = this.#itemsIndex.get(itemId);
    if (!item) {
      console.warn(`Item not found: ${itemId}`);
      return null;
    }
    return item;
  }

  /**
   * Resolve a message by looking via
   * index lookup
   * 
   * @param {*} message 
   * @returns 
   */
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

  /**
   * Return the flattened, sorted, message object
   * 
   * @returns Sorted message array
   */
  getOrderedMessages() {
    const messages = Object.values(this.chat.messages);

    // Simple convo
    const root = messages.find((msg) => !msg.parentMessageId);
    if (!root) {
      return messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    // Here we go. 
    // Messages might be out of order and need to be flattened
    // and sorted.
    const childrenMap = new Map();
    for (const message of messages) {
      if (message.parentMessageId) {
        const children = childrenMap.get(message.parentMessageId) || [];
        children.push(message);
        childrenMap.set(message.parentMessageId, children);
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
