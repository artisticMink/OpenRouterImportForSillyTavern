/* global SillyTavern */

import "./app.css";
import { OpenRouterChatConverter } from "./Converter";
import { useRef, useState } from "react";

function App() {
  const [error, setError] = useState(null);

  const fileRef = useRef(null);
console.log(SillyTavern.getContext());
  function startImport(data) {
    const converter = new OpenRouterChatConverter(SillyTavern.getContext());
    if (converter.validateFileStructure(data))
      try {
        converter.import(data, SillyTavern.getContext());
      } catch (error) {
        setError(error.message);
        console.log(error);
      }
  }

  function handleImportClick(event) {
    fileRef.current.click();
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const data = JSON.parse(text);
        startImport(data);
      } catch (error) {
        setError(`Error parsing JSON: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div id="orist-settings">
      <input
        id="orist-file-upload-dialogue"
        type="file"
        accept=".json,application/json"
        onChange={handleFileUpload}
        ref={fileRef}
      />
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b>OpenRouter Chat Import</b>
          <div
            class="inline-drawer-icon fa-solid fa-circle-chevron-down down interactable"
            tabindex="0"
            role="button"
          ></div>
        </div>
        <div class="inline-drawer-content">
          <div class="orist-file-upload-container">
            <div>{error ? <div class="orist-error">{error}. See console for details.</div> : null}</div>
            <div>
              <input
                id="orist-upload"
                class="orist-file-upload-button menu_button interactable"
                type="submit"
                value="Import"
                onClick={handleImportClick}
              ></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
