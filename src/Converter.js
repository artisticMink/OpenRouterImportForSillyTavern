import { Client } from "./Client.js";
import { Ui } from "./Ui";
import { Resolver as OrpgV3Resolver } from "./OrpgV3/Resolver.js";
import { Transformer as OrpgV3Transformer } from "./OrpgV3/Transformer.js";
import { Transformer as OrpgV2Transformer } from "./OrpgV2/Transformer.js";

export class OpenRouterChatConverter {
  // Static header for character creation
  newChatMetadata = [
    {
      chat_metadata: {},
      user_name: "unused",
      character_name: "unused",
    },
  ];

  stContext;
  client;

  constructor(stContext) {
    this.stContext = stContext;
    this.client = new Client(stContext);
  }

  /**
   * Import a open router chat export
   *
   * Object should've been validated at this point.
   *
   * @param {*} chat
   */
  import(chat) {
    switch (chat.version) {
      case "orpg.3.0":
        this.#log("Found version: orpg.3.0");
        Ui.showPopup((characterName, personaName) => {
          this.#importV3({
            chat,
            characterName,
            personaName,
            avatarUrl: characterName + ".png",
          });
        });
        break;
      case "orpg.2.0":
        this.#log("Found version: orpg.2.0");
        Ui.showPopup((characterName, personaName) => {
          this.#importV2({
            chat,
            characterName,
            personaName,
            avatarUrl: characterName + ".png",
          });
        });
        break;
      case "orpg.1.0":
        this.#log("Found version: orpg.1.0");
        Ui.showPopup((characterName, personaName) => {
          // V1 and V2 are similiar enough
          this.#importV2({
            chat,
            characterName,
            personaName,
            avatarUrl: characterName + ".png",
          });
        });
        break;
      default:
        throw Error("Chat version not supported");
    }
  }

  /**
   * Import a chat object that complies with orpg.3.0 spec
   *
   * @param {chat, characterName, personName, avatarUrl} param0
   */
  async #importV3({ chat, characterName, personaName, avatarUrl }) {
    await this.client.createCharacter(
      Object.assign(this.stContext.createCharacterData, {
        name: characterName,
        ch_name: characterName,
        actiontype: "createcharacter",
      })
    );

    const resolver = new OrpgV3Resolver(chat);
    const orderedMessages = resolver.getOrderedMessages();
    const newChat = orderedMessages.map((message) => {
      const resolved = resolver.resolveMessageContent(message);

      const transformed = OrpgV3Transformer.transform(
        resolved,
        characterName,
        personaName
      );

      if (transformed.is_user) {
        transformed.name = personaName;
      } else {
        transformed.name = characterName;
      }

      return transformed;
    });

    await this.#saveChat(newChat, { avatarUrl, characterName, personaName });
  }

  /**
   * Import a chat object that complies with orpg.2.0 or
   * orpg.1.0 spec
   *
   * @param {chat, characterName, personName, avatarUrl} param0
   */
  async #importV2({ chat, characterName, personaName, avatarUrl }) {
    await this.client.createCharacter(
      Object.assign(this.stContext.createCharacterData, {
        name: characterName,
        system_prompt: Object.values(chat.characters)[0]?.description,
        ch_name: characterName,
        actiontype: "createcharacter",
      })
    );

    const newChat = Object.values(chat.messages)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((message) => {
        const transformed = OrpgV2Transformer.transform(message);

        if (transformed.is_user) {
          transformed.name = personaName;
        } else {
          transformed.name = characterName;
        }

        return transformed;
      });

    await this.#saveChat(newChat, { avatarUrl, characterName, personaName });
  }

  /**
   * @param {*} jsonl
   * @param { avatarUrl, characterName, personaName } param1
   * @returns
   */
  #getFileBlob(jsonl, { avatarUrl, characterName, personaName }) {
    const blob = new Blob([jsonl], { type: "application/jsonl" });

    const formData = new FormData();
    // This nugget is for whoever re-used the file upload multer config for chat file import
    formData.append("avatar", blob, "chat.jsonl");
    formData.append("file_type", "jsonl");
    formData.append("avatar_url", avatarUrl);
    formData.append("character_name", characterName);
    formData.append("user_name", personaName);

    return formData;
  }

  /**
   * @param {*} newChat
   * @param { avatarUrl, characterName, personaName } param1
   */
  async #saveChat(newChat, { avatarUrl, characterName, personaName }) {
    const jsonl = [...this.newChatMetadata, ...newChat]
      .map((record) => JSON.stringify(record))
      .join("\n");

    const response = await this.client.import(
      this.#getFileBlob(jsonl, { avatarUrl, characterName, personaName })
    );

    if (response.body.error) {
      this.#log(response.body.error);
    } else {
      window.location.reload();
    }
  }

  /**
   * Perform a minimal check to determine if the chat object
   * can be imported at all.
   *
   * @param {*} data
   * @returns
   */
  validateFileStructure(data) {
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid JSON structure: expected object");
    }

    if (!data.version || typeof data.version !== "string") {
      throw new Error("Invalid format: missing or invalid version field");
    }

    return true;
  }

  #log(message) {
    console.log(`[OpenRouterChatImport]: ${message}`);
  }
}
