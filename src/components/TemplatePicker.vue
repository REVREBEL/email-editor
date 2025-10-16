<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import type { Design } from './types';

const emit = defineEmits(['select']);

const templates = ref<any[]>([]);
const showModal = ref(false);
const selectedTemplate = ref<any>(null);
const versions = ref<any[]>([]);

const fetchTemplates = () => {
  api.getTemplates().then((response) => {
    templates.value = response.data;
  });
};

const selectTemplate = (template: any) => {
  api.getTemplate(template.id).then((response) => {
    emit('select', response.data);
    showModal.value = false;
  });
};

const showHistory = (template: any) => {
  selectedTemplate.value = template;
  api.getVersions(template.id).then((response) => {
    versions.value = response.data;
  });
};

const selectVersion = (version: any) => {
  emit('select', { ...selectedTemplate.value, design: version.design_json });
  showModal.value = false;
};

onMounted(() => {
  fetchTemplates();
});
</script>

<template>
  <div>
    <button @click="showModal = true">Template Library</button>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Template Library</h2>
        <ul>
          <li v-for="template in templates" :key="template.id">
            <span>{{ template.name }} - Created: {{ new Date(template.createdAt).toLocaleString() }}</span>
            <div>
              <button @click="selectTemplate(template)">Select</button>
              <button @click="showHistory(template)">History</button>
            </div>
          </li>
        </ul>

        <div v-if="selectedTemplate">
          <h3>History for {{ selectedTemplate.name }}</h3>
          <ul>
            <li v-for="version in versions" :key="version.id">
              <span>Version {{ version.version }} - Created: {{ new Date(version.createdAt).toLocaleString() }}</span>
              <button @click="selectVersion(version)">Load Version</button>
            </li>
          </ul>
        </div>

        <button @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  min-width: 500px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
</style>
