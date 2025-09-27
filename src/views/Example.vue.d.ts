import { EmailEditorProps } from '../components/types';
declare const _default: import('vue').DefineComponent<
  {},
  {},
  {
    options: EmailEditorProps['options'];
    minHeight: EmailEditorProps['minHeight'];
  },
  {},
  {
    editorLoaded(): void;
    editorReady(): void;
    saveDesign(): void;
    exportHtml(): void;
  },
  import('vue').ComponentOptionsMixin,
  import('vue').ComponentOptionsMixin,
  {},
  string,
  import('vue').PublicProps,
  Readonly<{}> & Readonly<{}>,
  {},
  {},
  {
    EmailEditor: import('vue').DefineComponent<
      import('vue').ExtractPropTypes<{
        editorId: () => EmailEditorProps['editorId'];
        minHeight: {
          type: () => EmailEditorProps['minHeight'];
          default: string;
        };
        options: {
          type: () => EmailEditorProps['options'];
          default: () => {};
        };
        scriptUrl: () => EmailEditorProps['scriptUrl'];
      }>,
      {
        editor: import('vue').ShallowRef<
          import('embed/Editor').Editor | null,
          import('embed/Editor').Editor | null
        >;
        createSerializedEditor: (originalEditor: any) => any;
      },
      {},
      {
        id(): string | undefined;
      },
      {
        loadEditor(): void;
        exportHtml(
          callback: Parameters<EmailEditorProps['exportHtml']>[0]
        ): void;
        loadDesign(design: Parameters<EmailEditorProps['loadDesign']>[0]): void;
        saveDesign(
          callback: Parameters<EmailEditorProps['saveDesign']>[0]
        ): void;
      },
      import('vue').ComponentOptionsMixin,
      import('vue').ComponentOptionsMixin,
      {},
      string,
      import('vue').PublicProps,
      Readonly<
        import('vue').ExtractPropTypes<{
          editorId: () => EmailEditorProps['editorId'];
          minHeight: {
            type: () => EmailEditorProps['minHeight'];
            default: string;
          };
          options: {
            type: () => EmailEditorProps['options'];
            default: () => {};
          };
          scriptUrl: () => EmailEditorProps['scriptUrl'];
        }>
      > &
        Readonly<{}>,
      {
        minHeight: string | number | undefined;
        options: import('embed/Config').Config | undefined;
      },
      {},
      {},
      {},
      string,
      import('vue').ComponentProvideOptions,
      true,
      {},
      any
    >;
  },
  {},
  string,
  import('vue').ComponentProvideOptions,
  true,
  {},
  any
>;
export default _default;
//# sourceMappingURL=Example.vue.d.ts.map
