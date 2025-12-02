import { actions } from "../action";
import { getCurrentPostion } from "../text_utils";
import { toggleBlockContainer } from "./block";
import { insertCodeBlock } from "./code";
import { toggleDivider } from "./divider";
import { toggleFormatting } from "./formatting";
import { changeHeaderSize } from "./header_size";
import { insertImageBlock } from "./image";
import { insertLinkSnippet, insertFooter, deleteLink, insertPath, insertLinkBlock } from "./link";
import { ListMarker, toggleList } from "./list";
import { insertMathBlock } from "./math";
import { toggleBlockList } from "./quote";
import { insertTableBlock } from "./table";

export const markdownActions: { [key: string]: () => Promise<void> } = {
    'Markdown: Toggle Bold': async () => { await toggleFormatting("**"); },
    'Markdown: Toggle Italic': async () => { await toggleFormatting("*"); },
    'Markdown: Toggle Strikethrough': async () => { await toggleFormatting("~~"); },
    'Markdown: Toggle Math Span': async () => { await toggleFormatting("$"); },
    'Markdown: Toggle Math Block': async () => { await insertMathBlock(); },
    'Markdown: Toggle Code Span': async () => { await toggleFormatting("`"); },
    'Markdown: Toggle Code Block': async () => { await insertCodeBlock(); },
    'Markdown: Toggle Container Block': async () => { await toggleBlockContainer(":::", ":::", " ${1:info}"); },
    'Markdown: Toggle Detail Block': async () => { await toggleBlockContainer("<details> ", "</details>", "<summary> ${1:title} </summary>"); },
    'Markdown: Toggle Quote Block': async () => { await toggleBlockList(">"); },
    'Markdown: Insert Link': async () => { await insertLinkBlock(); },
    'Markdown: Insert Image': async () => { await insertImageBlock(); },
    'Markdown: Insert Link Reference': async () => { await insertFooter("[${0:$2}][${1:$3}]", "[${1:$3}]:$1 \"${0:$2}\"", ["link", "text", `reference_${getCurrentPostion()}`]); },
    'Markdown: Insert Footnotes': async () => { await insertFooter("[^${0:$2}]", "[^${1:$2}]:$1", ["link", "text"]); },
    'Markdown: Insert Path': async () => { await insertPath(); },
    'Markdown: Delete Link': async () => { await deleteLink(); },
    'Markdown: Increase Header Level': async () => { await changeHeaderSize(true); },
    'Markdown: Decrease Header Level': async () => { await changeHeaderSize(false); },
    'Markdown: Insert Table': async () => { await insertTableBlock(); },
    'Markdown: Insert Divider': async () => { await toggleDivider("\n---\n$0", "\n---\n$0", "\n---\n",); },
    'Markdown: Insert New Line': async () => { await toggleDivider("\n$0", "\n$0", "\n"); },
    'Markdown: Toggle Order List': async () => { await toggleList(ListMarker.NUM); },
    'Markdown: Toggle Unorder List': async () => { await toggleList(ListMarker.DASH); },
    'Markdown: Toggle Check List': async () => { await toggleList(ListMarker.TASK); },
};
export function readMarkdownToolAction() {
    for (const name in markdownActions) {
        actions[name] = markdownActions[name];
    }
}