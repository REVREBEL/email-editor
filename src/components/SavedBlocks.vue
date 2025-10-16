<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const props = defineProps<{ editor: any }>();

const blocks = ref<any[]>([]);

const fetchBlocks = () => {
  api.getBlocks().then((response) => {
    blocks.value = response.data;
  });
};

const onDragStart = (event: DragEvent, block: any) => {
  event.dataTransfer?.setData('text/plain', JSON.stringify(block.block_json));
};

const saveBlock = () => {
  props.editor?.getSelectedBlock((block: any) => {
    const name = prompt('Enter a name for the block:');
    if (!name) return;

    api.createBlock({ name, category: 'General', block_json: block }).then(() => {
      fetchBlocks();
    });
  });
};

onMounted(() => {
  fetchBlocks();
});
</script>

<template>
  <div class="saved-blocks">
    <h3>Saved Blocks</h3>
    <button @click="saveBlock">Save Selected Block</button>
    <ul>
      <li v-for="block in blocks" :key="block.id" draggable="true" @dragstart="onDragStart($event, block)">
        {{ block.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.saved-blocks {
  padding: 10px;
  border-left: 1px solid #ccc;
}
</style>
