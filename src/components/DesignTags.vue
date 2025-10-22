<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';

const props = defineProps<{ template: any }>();

const tags = ref<any[]>([]);
const newTagKey = ref('');
const newTagValue = ref('');

const fetchTags = () => {
  if (props.template) {
    api.get(`/templates/${props.template.id}/design-tags`).then((response) => {
      tags.value = response.data;
    });
  }
};

const addTag = () => {
  if (props.template && newTagKey.value && newTagValue.value) {
    api.post(`/templates/${props.template.id}/design-tags`, { key: newTagKey.value, value: newTagValue.value }).then(() => {
      fetchTags();
      newTagKey.value = '';
      newTagValue.value = '';
    });
  }
};

watch(() => props.template, fetchTags);

onMounted(() => {
  fetchTags();
});
</script>

<template>
  <div class="design-tags">
    <h3>Design Tags</h3>
    <ul>
      <li v-for="tag in tags" :key="tag.id">
        {{ tag.key }}: {{ tag.value }}
      </li>
    </ul>
    <div>
      <input v-model="newTagKey" placeholder="Key" />
      <input v-model="newTagValue" placeholder="Value" />
      <button @click="addTag">Add Tag</button>
    </div>
  </div>
</template>

<style scoped>
.design-tags {
  padding: 10px;
  border-left: 1px solid #ccc;
}
</style>
