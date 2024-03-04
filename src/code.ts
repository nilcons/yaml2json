import { basicSetup } from "codemirror";
import { EditorView, ViewPlugin, ViewUpdate, keymap } from "@codemirror/view";
import { Transaction } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";

import { parse, stringify } from "yaml";

////////////////////////////////////////////////////////////////////////////////

const yamlElem = document.getElementById("ed-yaml")!;
const jsonElem = document.getElementById("ed-json")!;

////////////////////////////////////////////////////////////////////////////////
// Examples:
const yamlExample = `---
# Comment
map:
  key: value
  one: 1
  true: true
  foo: bar
sequence:
  - apple
  - orange
  - 2.5
`;
const jsonExample = `{
  "map": {
    "key": "value",
    "one": 1,
    "true": true,
    "foo": "bar"
  },
  "sequence": ["apple", "orange", 2.5]
}`;

////////////////////////////////////////////////////////////////////////////////

const yamlPlugin = ViewPlugin.fromClass(class {
    constructor(_view: EditorView) { }

    update(update: ViewUpdate) {
        if (!update.docChanged) return;
        if (!update.transactions.some(tr => tr.annotation(Transaction.userEvent))) return;
        try {
            const value = parse(update.view.state.doc.toString());
            jsonView.dispatch({
                changes: {
                    from: 0,
                    to: jsonView.state.doc.length,
                    insert: JSON.stringify(value, null, 2),
                },
            });
        } catch (e) {
            console.error("YAML parse failed", e);
        }
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
            yamlView.dispatch({
                changes: {
                    from: 0,
                    to: yamlView.state.doc.length,
                    insert: stringify(value),
                },
            });
        } catch (e) {
            console.error("JSON parse failed", e);
        }
    }
});

////////////////////////////////////////////////////////////////////////////////

const extensions = [basicSetup, keymap.of([indentWithTab])];
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
