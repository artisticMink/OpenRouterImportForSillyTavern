export class Client {
  stContext;

  constructor(stContext) {
    this.stContext = stContext;
  }

  async import(formData) {
    const url = "/api/chats/import";
    const headers = this.stContext.getRequestHeaders();
    delete headers['Content-Type'];

    return await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-cache",
    });
  }

  async createCharacter(body) {
    const url = "/api/characters/create";

    return await fetch(url, {
      method: "POST",
      headers: this.stContext.getRequestHeaders(),
      body: JSON.stringify(body),
      cache: "no-cache",
    });
  }
}
