export class Ui {
  static showPopup(importCallback) {
    document.body.insertAdjacentHTML("beforeend", Ui.#getHtml());

    document
      .querySelector("#orist-popup-cancel")
      .addEventListener("click", Ui.removePopup);

    const importButton = document.querySelector("#orist-popup-import");
    const importHandler = () => {
      const characterName = document.querySelector(
        "#orist-popup-character"
      ).value;
      const personaName = document.querySelector("#orist-popup-persona").value;

      importCallback(characterName, personaName);
    };

    importButton.addEventListener("click", importHandler);

    importButton._importHandler = importHandler;
  }

  static removePopup() {
    const popupElement = document.querySelector("#orist-shadow-popup");
    if (popupElement) {
      const importButton = document.querySelector("#orist-popup-import");
      if (importButton && importButton._importHandler) {
        importButton.removeEventListener("click", importButton._importHandler);
      }
      document.body.removeChild(popupElement);
    }
  }

  static #getHtml = () => {
    return `<div id="orist-shadow-popup">
              <div id="orist-popup-outer" class="wider_dialogue_popup">
                  <div class="orist-popup-inner">
                      <div class="orist-popup-group">
                          <label for="orist-popup-character">Character</label>
                          <input id="orist-popup-character" class="text_pole margin0" />
                          <small>Set the desired character.</small>
                      </div>
                      <div class="orist-popup-group">
                          <label for="orist-popup-persona">Persona</label>
                          <input id="orist-popup-persona" class="text_pole margin0" />
                          <small>Set the desired persona.</small>
                      </div>
                      <div class="orist-popup-group orist-flex">
                          <div id="orist-popup-import" class="menu_button">Import</div>
                          <div id="orist-popup-cancel" class="menu_button" data-i18n="Cancel">Close</div>
                      </div>
                  </div>
              </div>
          </div>`;
  };
}
