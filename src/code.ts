import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";

////////////////////////////////////////////////////////////////////////////////

const yamlElem = document.getElementById("ed-yaml")!;
const jsonElem = document.getElementById("ed-json")!;

const yamlView = new EditorView({
    doc: "Here be yaml",
    extensions: [basicSetup, yaml()],
    parent: yamlElem,
});

const jsonView = new EditorView({
    doc: "Here be json",
    extensions: [basicSetup, json()],
    parent: jsonElem,
});
