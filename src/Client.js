export class Client {
  stContext;

  constructor(stContext) {
    this.stContext = stContext;
  }

  /**
   * Import a new chat
   * 
   * @param {*} formData 
   * @returns 
   */
  async import(formData) {
    const url = "/api/chats/import";
    const headers = this.stContext.getRequestHeaders();

    // Let the browser set the boundary
    delete headers['Content-Type'];

    return await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-cache",
    });
  }

  /**
   * Create a new character
   * 
   * @param {*} body 
   * @returns 
   */
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
