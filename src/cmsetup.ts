import { lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { highlightSelectionMatches } from '@codemirror/search';
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
export const ourSetup = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
        //     ...closeBracketsKeymap,
        //     ...searchKeymap,
        //     ...foldKeymap,
        //     ...completionKeymap,
        //     ...lintKeymap,
    ]),

    // on top of minimal, stolen from basicSetup
    lineNumbers(),
    highlightActiveLineGutter(),
    // foldGutter(), // we don't need the folds
    // dropCursor(), // no drag and drop
    // EditorState.allowMultipleSelections.of(true), // no multiple selections
    indentOnInput(), // closing brace in json reindents correctly
    bracketMatching(), // highlights the matching bracket, only visual, no automatic edit
    // closeBrackets(), // annoying when playing with brackets, automatically adds closing bracket when typing opening bracket
    // autocompletion(),
    // rectangularSelection(), crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
];
