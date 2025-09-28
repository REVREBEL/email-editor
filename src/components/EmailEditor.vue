<template>
  <div
    :id="id"
    class="unlayer-editor"
    :style="{ minHeight: minHeight + 'px' }"
  ></div>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, toRaw, useAttrs } from 'vue';
import pkg from '../../package.json';
import { loadScript } from './loadScript';
import type {
  EmailEditorProps,
  ChildComponentPublicMethods,
  UnlayerEditor,
  ExportHtmlCallback,
  SaveDesignCallback,
  Design,
} from './types';

let lastEditorId = 0;

const props = withDefaults(defineProps<EmailEditorProps>(), {
  minHeight: 500,
  options: () => ({}),
});

const emit = defineEmits(['load', 'ready']);

const editor = shallowRef<UnlayerEditor | null>(null);
const id = computed(() => props.editorId || `editor-${++lastEditorId}`);

const loadEditor = () => {
const options = { ...toRaw(props.options) };

  // @ts-ignore
  const unlayer = window.unlayer;
  if (!unlayer) return;

  editor.value = unlayer.createEditor({
    ...options,
    id: id.value,
    source: {
      name: pkg.name,
      version: pkg.version,
    },
  });

  emit('load');
  editor.value?.addEventListener('editor:ready', () => {
    emit('ready');
  });
};

onMounted(() => {
  loadScript(loadEditor, props.scriptUrl);
});

const exportHtml: UnlayerEditor['exportHtml'] = (callback: ExportHtmlCallback) => {
  toRaw(editor.value)?.exportHtml(callback);
};

const saveDesign: UnlayerEditor['saveDesign'] = (callback: SaveDesignCallback) => {
  toRaw(editor.value)?.saveDesign(callback);
};

const loadDesign: UnlayerEditor['loadDesign'] = (design: Design) => {
  toRaw(editor.value)?.loadDesign(design);
};

defineExpose<ChildComponentPublicMethods>({
  editor: editor.value,
  exportHtml,
  saveDesign,
  loadDesign,
});
</script>







<style scoped>
.unlayer-editor {
  flex: 1;
  display: flex;
}
</style>
