import { EmailEditorProps } from './types';
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    editorId: () => EmailEditorProps["editorId"];
    minHeight: {
        type: () => EmailEditorProps["minHeight"];
        default: string;
    };
    options: {
        type: () => EmailEditorProps["options"];
        default: () => {};
    };
    scriptUrl: () => EmailEditorProps["scriptUrl"];
}>, {
    editor: import("vue").ShallowRef<import("embed/Editor").Editor | null, import("embed/Editor").Editor | null>;
    createSerializedEditor: (originalEditor: any) => any;
}, {}, {
    id(): string | undefined;
}, {
    loadEditor(): void;
    /**
     * @deprecated This method will be removed in the next major release. Use `editor.exportHtml` instead.
     */
    exportHtml(callback: Parameters<EmailEditorProps["exportHtml"]>[0]): void;
    /**
     * @deprecated This method will be removed in the next major release. Use `editor.loadDesign` instead.
     */
    loadDesign(design: Parameters<EmailEditorProps["loadDesign"]>[0]): void;
    /**
     * @deprecated This method will be removed in the next major release. Use `editor.saveDesign` instead.
     */
    saveDesign(callback: Parameters<EmailEditorProps["saveDesign"]>[0]): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    editorId: () => EmailEditorProps["editorId"];
    minHeight: {
        type: () => EmailEditorProps["minHeight"];
        default: string;
    };
    options: {
        type: () => EmailEditorProps["options"];
        default: () => {};
    };
    scriptUrl: () => EmailEditorProps["scriptUrl"];
}>> & Readonly<{}>, {
    minHeight: string | number | undefined;
    options: import("embed/Config").Config | undefined;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=EmailEditor.vue.d.ts.map