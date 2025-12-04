import * as vscode from "vscode";
import { Toolbox, toolboxs } from "../model/toolbox";
import { toolboxMarkdown } from "./content/markdown";
import { intersectionList } from "../utilities/list_utils";

export function registerDecorationHover(context: vscode.ExtensionContext, canLanguages: string[] = []) {
    // 1. 定义一个装饰类型：在当前行末尾显示淡淡的提示
    const currentLineDecoration = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: '',
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 0 0 100em',
        },
    });
    const gutterDecoration = vscode.window.createTextEditorDecorationType({
        gutterIconPath: context.asAbsolutePath('icon_hover.png'),
        gutterIconSize: 'contain',
    });
    context.subscriptions.push(currentLineDecoration, gutterDecoration);

    // 2. 更新当前行装饰：只给“当前行”设置 Decoration
    function updateCurrentLineDecoration(editor: vscode.TextEditor | undefined) {
        if (!editor) {
            return;
        }
        const languageId = editor.document.languageId
        if(languageId !== 'markdown' && languageId !== 'tex' && languageId !== 'latex') {
            return;
        }
        
        const currentLine = editor.selection.active.line; // 当前光标所在行号

        // 如果你还要加“必须是空行”的判断，可以在这里加：
        // const lineText = doc.lineAt(currentLine).text;
        // if (lineText.trim().length !== 0) {
        //   // 不是空行，则清除装饰
        //   editor.setDecorations(currentLineDecoration, []);
        //   return;
        // }

        // 只为当前行创建一个 range
        const line = editor.document.lineAt(currentLine);
        const range = new vscode.Range(currentLine, 0, currentLine, line.text.length);
        
        // hoverMessage
        const hoverMessage: vscode.MarkdownString[] = [] 
        // 没有选区才需要添加，避免和hover.ts冲突，重复添加hoverMessage
        if (editor.selection.isEmpty || !editor.selection.contains(new vscode.Position(line.lineNumber, line.text.length))) {
            const toolboxList = Object.values(toolboxs).flatMap(e => e);
            for (const toolbox of toolboxList) {
                const list = typeof toolbox.activate === "boolean"
                    ? (toolbox.activate ? canLanguages : [])
                    : intersectionList(toolbox.activate.languages, canLanguages);
                if (list.length > 0) {
                    const markdowns = toolboxMarkdown(toolbox, editor.document.languageId);
                    for (const markdown of markdowns) {
                        markdown.isTrusted = true;
                        hoverMessage.push(markdown)
                    }
                }
            }
        }

        const options: vscode.DecorationOptions[] = [
            {
                range,
                hoverMessage: hoverMessage,
            },
        ];
        // 非常关键：这里会把“其它行”的装饰全部替换掉
        editor.setDecorations(currentLineDecoration, options);
        editor.setDecorations(gutterDecoration, [{ range }]);
    }

    // 3. 监听光标变化，只更新当前行
    vscode.window.onDidChangeTextEditorSelection(
        (event) => {
            updateCurrentLineDecoration(event.textEditor);
        },
        null,
        context.subscriptions,
    );

    // 4. 活动编辑器变化时重新更新（切换 tab）
    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            updateCurrentLineDecoration(editor ?? undefined);
        },
        null,
        context.subscriptions,
    );

    // 5. 插件激活时初始化一次
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        updateCurrentLineDecoration(editor);
    }
}
