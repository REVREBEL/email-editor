<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const emit = defineEmits(['select']);

const mediaAssets = ref<any[]>([]);
const showModal = ref(false);

const fetchMediaAssets = () => {
  api.getMedia().then((response) => {
    mediaAssets.value = response.data;
  });
};

const selectAsset = (asset: any) => {
  emit('select', asset.url);
  showModal.value = false;
};

const onFileChange = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  api.uploadMedia(file).then((response) => {
    emit('select', response.data.url);
    showModal.value = false;
  });
};

onMounted(() => {
  fetchMediaAssets();
});

defineExpose({
  showModal: () => { showModal.value = true; },
});
</script>

<template>
  <div>
    <button @click="showModal = true">File Manager</button>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>File Manager</h2>
        <input type="file" @change="onFileChange" />
        <ul>
          <li v-for="asset in mediaAssets" :key="asset.id">
            <img :src="asset.url" width="100" />
            <button @click="selectAsset(asset)">Select</button>
          </li>
        </ul>
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
  display: flex;
  flex-wrap: wrap;
}

li {
  margin: 10px;
}
</style>
