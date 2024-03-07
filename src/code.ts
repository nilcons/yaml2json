import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Transaction } from "@codemirror/state";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";
import { ourSetup } from "./cmsetup";

import { parse, stringify } from "yaml";
let yamlVersion: "1.1" | "1.2" = "1.1";
const yparse = (s: string) => parse(s, { version: yamlVersion });

////////////////////////////////////////////////////////////////////////////////

const yamlElem = document.getElementById("ed-yaml")!;
const jsonElem = document.getElementById("ed-json")!;
const messageElem = document.getElementById("message")!;
const messageTextElem = document.getElementById("message-text")!;
const closeMessageElem = document.getElementById("close-message")!;
const yamlVersionElem = document.getElementById("yaml-version")! as HTMLSelectElement;

////////////////////////////////////////////////////////////////////////////////
// Examples:
const yamlExample = `---
map:
  key: value
  one: 1
  bool: true
  foo: bar
sequence: &copy
  - apple
  - orange
  - 2.5
# Comment: YAML supports copy-paste built-in, yay!
repeated:
  sequence: *copy
`;
const initialValue = yparse(yamlExample);
const jsonExample = JSON.stringify(initialValue, null, 2);

let currentValue: string | undefined = JSON.stringify(initialValue);

////////////////////////////////////////////////////////////////////////////////

const yamlUpdate = (yamlInput: string) => {
    try {
        const value = yparse(yamlInput);
        const s = JSON.stringify(value);
        if (s === currentValue) return;
        currentValue = s;
        jsonView.dispatch({
            changes: {
                from: 0,
                to: jsonView.state.doc.length,
                insert: JSON.stringify(value, null, 2),
            },
        });
        closeMessage();
    } catch (e) {
        currentValue = undefined;
        showMessage("" + e);
    }
};

const yamlPlugin = ViewPlugin.fromClass(class {
    constructor(_view: EditorView) { }

    update(update: ViewUpdate) {
        if (!update.docChanged) return;
        if (!update.transactions.some(tr => tr.annotation(Transaction.userEvent))) return;
        yamlUpdate(update.view.state.doc.toString());
    }
});

////////////////////////////////////////////////////////////////////////////////

const jsonPlugin = ViewPlugin.fromClass(class {
    constructor(_view: EditorView) { }

    update(update: ViewUpdate) {
        if (!update.docChanged) return;
        if (!update.transactions.some(tr => tr.annotation(Transaction.userEvent))) return;
        try {
            const value = JSON.parse(update.view.state.doc.toString());
            const s = JSON.stringify(value);
            if (s === currentValue) return;
            currentValue = s;
            yamlView.dispatch({
                changes: {
                    from: 0,
                    to: yamlView.state.doc.length,
                    insert: "---\n" + stringify(value),
                },
            });
            closeMessage();
        } catch (e) {
            currentValue = undefined;
            showMessage("JSON: " + e);
        }
    }
});

////////////////////////////////////////////////////////////////////////////////

const extensions = [ourSetup];
const yamlView = new EditorView({
    doc: yamlExample,
    extensions: [extensions, yaml(), yamlPlugin],
    parent: yamlElem,
});

const jsonView = new EditorView({
    doc: jsonExample,
    extensions: [extensions, json(), jsonPlugin],
    parent: jsonElem,
});

window.addEventListener('keydown', function(event: KeyboardEvent) {
    if (event.key === 'F1' || event.code === 'F1') {
        event.preventDefault();
        yamlView.focus();
    }
    if (event.key === 'F2' || event.code === 'F2') {
        event.preventDefault();
        jsonView.focus();
    }
});

////////////////////////////////////////////////////////////////////////////////

function showMessage(message: string) {
    messageTextElem.textContent = message;
    messageElem.classList.remove("hidden");
}

function closeMessage() {
    messageElem.classList.add("hidden");
}

closeMessageElem.addEventListener("click", closeMessage);

yamlVersionElem.addEventListener("change", () => {
    yamlVersion = yamlVersionElem.value as "1.1" | "1.2";
    yamlUpdate(yamlView.state.doc.toString());
});

////////////////////////////////////////////////////////////////////////////////

document.getElementById("copy-yaml")!.addEventListener("click", () => {
    navigator.clipboard.writeText(yamlView.state.doc.toString());
});
document.getElementById("copy-json")!.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonView.state.doc.toString());
});
