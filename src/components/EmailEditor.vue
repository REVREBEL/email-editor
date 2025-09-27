<template>
  <div
    v-bind:id="id"
    class="unlayer-editor"
    v-bind:style="{ minHeight: minHeight }"
  ></div>
</template>

<script lang="ts">
import { defineComponent, shallowRef, toRaw } from 'vue';
import pkg from '../../package.json';
import { loadScript } from './loadScript';
import { EmailEditorProps } from './types';
let lastEditorId = 0;

export default defineComponent({
  name: 'EmailEditor',
  emits: ['load', 'ready'], // <-- Add this line
  props: {
    editorId: String as () => EmailEditorProps['editorId'],
    minHeight: {
      type: String as () => EmailEditorProps['minHeight'],
      default: '500px',
    },
    options: {
      type: Object as () => EmailEditorProps['options'],
      default: () => ({}),
    },
    scriptUrl: String as () => EmailEditorProps['scriptUrl'],
  },
  computed: {
    id(): string | undefined {
      return this.editorId || `editor-${++lastEditorId}`;
    },
  },
  setup() {
    const editor = shallowRef<EmailEditorProps['editor'] | null>(null);

    const createSerializedEditor = (originalEditor: any) => {
      if (!originalEditor) return null;

      return {
        ...originalEditor,
        registerCallback: (event: string, callback: Function) => {
          originalEditor.registerCallback(
            event,
            (data: any, done: Function) => {
              callback(data, (result: any) => {
                const rawResult = toRaw(result);
                done(rawResult);
              });
            }
          );
        },
      };
    };

    return {
      editor,
      createSerializedEditor,
    };
  },
  mounted() {
    loadScript(this.loadEditor.bind(this), this.scriptUrl);
  },
  methods: {
    loadEditor() {
      const rawEditor = unlayer.createEditor({
        ...this.options,
        id: this.id,
        source: {
          name: pkg.name,
          version: pkg.version,
        },
      });

      // Wrap the editor with serialization handling
      this.editor = this.createSerializedEditor(rawEditor);

      this.$emit('load');
      this.editor?.addEventListener('editor:ready', () => {
        this.$emit('ready');
      });
    },
    /**
     * @deprecated This method will be removed in the next major release. Use `editor.exportHtml` instead.
     */
    exportHtml(callback: Parameters<EmailEditorProps['exportHtml']>[0]) {
      this.editor?.exportHtml(callback);
    },
    /**
     * @deprecated This method will be removed in the next major release. Use `editor.loadDesign` instead.
     */
    loadDesign(design: Parameters<EmailEditorProps['loadDesign']>[0]) {
      this.editor?.loadDesign(design);
    },
    /**
     * @deprecated This method will be removed in the next major release. Use `editor.saveDesign` instead.
     */
    saveDesign(callback: Parameters<EmailEditorProps['saveDesign']>[0]) {
      this.editor?.saveDesign(callback);
    },
  },
});
</script>

<style scoped>
.unlayer-editor {
  flex: 1;
  display: flex;
}
</style>
