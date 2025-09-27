declare const _default: import("vue").DefineComponent<{}, {}, {
    options: {
        locale: string;
        projectId: number;
        minHeight: string;
        appearance: {
            theme: "dark";
            panels: {
                tools: {
                    dock: "left" | "right" | undefined;
                };
            };
        };
        version: string;
        features: {
            textEditor: {
                spellChecker: boolean;
                tables: boolean;
                inlineFontControls: boolean;
                customButtons: {
                    name: string;
                    text: string;
                    icon: string;
                    onSetup: () => void;
                    onAction: (data: {
                        text: string;
                    }, callback: (text: string) => void) => void;
                }[];
            };
            colorPicker: {
                presets: string[];
            };
        };
        tools: {
            image: {
                enabled: boolean;
            };
        };
        fonts: {
            showDefaultFonts: boolean;
            customFonts: {
                label: string;
                value: string;
                url: string;
                weights: {
                    label: string;
                    value: number;
                }[];
            }[];
        };
    };
}, {}, {
    editorLoaded(): void;
    editorReady(): void;
    saveDesign(): void;
    exportHtml(): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {
    EmailEditor: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        editorId: () => import("../components/types.js").EmailEditorProps["editorId"];
        minHeight: {
            type: () => import("../components/types.js").EmailEditorProps["minHeight"];
            default: string;
        };
        options: {
            type: () => import("../components/types.js").EmailEditorProps["options"];
            default: () => {};
        };
        scriptUrl: () => import("../components/types.js").EmailEditorProps["scriptUrl"];
        appearance: () => import("../components/types.js").EmailEditorProps["appearance"];
        locale: () => import("../components/types.js").EmailEditorProps["locale"];
        projectId: () => import("../components/types.js").EmailEditorProps["projectId"];
        tools: () => import("../components/types.js").EmailEditorProps["tools"];
    }>, {
        editor: import("vue").ShallowRef<import("embed/Editor").Editor | null, import("embed/Editor").Editor | null>;
        createSerializedEditor: (originalEditor: any) => any;
    }, {}, {
        id(): string | undefined;
    }, {
        loadEditor(): void;
        exportHtml(callback: Parameters<import("../components/types.js").EmailEditorProps["exportHtml"]>[0]): void;
        loadDesign(design: Parameters<import("../components/types.js").EmailEditorProps["loadDesign"]>[0]): void;
        saveDesign(callback: Parameters<import("../components/types.js").EmailEditorProps["saveDesign"]>[0]): void;
    }, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        editorId: () => import("../components/types.js").EmailEditorProps["editorId"];
        minHeight: {
            type: () => import("../components/types.js").EmailEditorProps["minHeight"];
            default: string;
        };
        options: {
            type: () => import("../components/types.js").EmailEditorProps["options"];
            default: () => {};
        };
        scriptUrl: () => import("../components/types.js").EmailEditorProps["scriptUrl"];
        appearance: () => import("../components/types.js").EmailEditorProps["appearance"];
        locale: () => import("../components/types.js").EmailEditorProps["locale"];
        projectId: () => import("../components/types.js").EmailEditorProps["projectId"];
        tools: () => import("../components/types.js").EmailEditorProps["tools"];
    }>> & Readonly<{}>, {
        minHeight: string | number | undefined;
        options: import("embed/Config").Config | undefined;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
