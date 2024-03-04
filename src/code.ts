import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";

////////////////////////////////////////////////////////////////////////////////

const yamlElem = document.getElementById("ed-yaml")!;
const jsonElem = document.getElementById("ed-json")!;

const extensions = [basicSetup, keymap.of([indentWithTab])];
const yamlView = new EditorView({
    doc: "Here be yaml",
    extensions: [extensions, yaml()],
    parent: yamlElem,
});

const jsonView = new EditorView({
    doc: "Here be json",
    extensions: [extensions, json()],
    parent: jsonElem,
});
