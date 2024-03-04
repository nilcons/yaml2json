import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";

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
const extensions = [basicSetup, keymap.of([indentWithTab])];
const yamlView = new EditorView({
    doc: yamlExample,
    extensions: [extensions, yaml()],
    parent: yamlElem,
});

const jsonView = new EditorView({
    doc: jsonExample,
    extensions: [extensions, json()],
    parent: jsonElem,
});
