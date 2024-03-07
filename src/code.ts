import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder, Text, Transaction } from "@codemirror/state";
import { yaml } from "@codemirror/lang-yaml";
import { json } from "@codemirror/lang-json";
import { ourSetup } from "./cmsetup";

import * as YAML from "yaml";

////////////////////////////////////////////////////////////////////////////////

const yamlElem = document.getElementById("ed-yaml")!;
const jsonElem = document.getElementById("ed-json")!;
const messageElem = document.getElementById("message")!;
const messageTextElem = document.getElementById("message-text")!;
const closeMessageElem = document.getElementById("close-message")!;
const yamlVersionElem = document.getElementById("yaml-version")! as HTMLSelectElement;

////////////////////////////////////////////////////////////////////////////////
// Parsing

type ParseResult = {
    value: any;
    errorMessage?: string;
    errorLine?: number;
}
const lineRegex = /line (\d+)/;

let yamlVersion: "1.1" | "1.2" = "1.1";
function yparse(s: string): ParseResult {
    try {
        return { value: YAML.parse(s, { version: yamlVersion }) };
    }
    catch (e) {
        const errorMessage = "" + e;
        const m = lineRegex.exec(errorMessage);
        let errorLine: number | undefined;
        if (m) {
            errorLine = parseInt(m[1]);
        }
        return { value: undefined, errorMessage, errorLine };
    }
}

function jparse(s: string): ParseResult {
    try {
        return { value: JSON.parse(s) };
    }
    catch (e) {
        const errorMessage = "JSON: " + e;
        const m = lineRegex.exec(errorMessage);
        let errorLine: number | undefined;
        if (m) {
            errorLine = parseInt(m[1]);
        }
        return { value: undefined, errorMessage, errorLine };
    }
}

function parse(yamlSide: boolean, s: string): ParseResult {
    return yamlSide ? yparse(s) : jparse(s);
}

////////////////////////////////////////////////////////////////////////////////
// Format

function yformat(value: any): string {
    return YAML.stringify(value, { version: yamlVersion, directives: true });
}

function jformat(value: any): string {
    return JSON.stringify(value, null, 2);
}

function format(yamlSide: boolean, value: any): string {
    return yamlSide ? jformat(value) : yformat(value);
}

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
const initialValue = yparse(yamlExample).value;
const jsonExample = format(true, initialValue);

let currentValue: string | undefined = JSON.stringify(initialValue);

////////////////////////////////////////////////////////////////////////////////

const sideUpdate = (yamlSide: boolean, input: Text): DecorationSet => {
    const r = parse(yamlSide, input.toString());
    if (r.errorMessage) {
        showMessage(r.errorMessage);
        currentValue = undefined;

        const builder = new RangeSetBuilder<Decoration>();
        if (r.errorLine !== undefined) {
            const line = input.line(r.errorLine);
            if (line) {
                builder.add(line.from, line.from, lineError);
            }
        }
        return builder.finish();
    }
    const s = JSON.stringify(r.value);
    if (s === currentValue) return Decoration.none;
    currentValue = s;
    const otherView = yamlSide ? jsonView : yamlView;
    otherView.dispatch({
        changes: {
            from: 0,
            to: otherView.state.doc.length,
            insert: format(yamlSide, r.value),
        },
    });
    closeMessage();
    return Decoration.none;
};

////////////////////////////////////////////////////////////////////////////////
const lineError = Decoration.line({ class: "cm-error" });
const sideTheme = EditorView.baseTheme({
    ".cm-error": { backgroundColor: "#fbb" },
});

const sidePlugin = (yamlSide: boolean) => ViewPlugin.fromClass(class {
    decorations: DecorationSet = Decoration.none;
    constructor(_view: EditorView) { }

    update(update: ViewUpdate) {
        if (!update.docChanged) return;
        if (!update.transactions.some(tr => tr.annotation(Transaction.userEvent))) return;
        this.decorations = sideUpdate(yamlSide, update.view.state.doc);
    }
}, {
    decorations: v => v.decorations,
});

////////////////////////////////////////////////////////////////////////////////

const extensions = [ourSetup];
const yamlView = new EditorView({
    doc: yamlExample,
    extensions: [extensions, yaml(), sideTheme, sidePlugin(true)],
    parent: yamlElem,
});

const jsonView = new EditorView({
    doc: jsonExample,
    extensions: [extensions, json(), sideTheme, sidePlugin(false)],
    parent: jsonElem,
});

window.addEventListener('keydown', function (event: KeyboardEvent) {
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
    sideUpdate(true, yamlView.state.doc);
});

////////////////////////////////////////////////////////////////////////////////

document.getElementById("copy-yaml")!.addEventListener("click", () => {
    navigator.clipboard.writeText(yamlView.state.doc.toString());
});
document.getElementById("copy-json")!.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonView.state.doc.toString());
});
