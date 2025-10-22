<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const emit = defineEmits(['select']);

const mediaAssets = ref<any[]>([]);
const showModal = ref(false);

const fetchMediaAssets = () => {
  api.get('/media').then((response) => {
    mediaAssets.value = response.data;
  });
};

const selectAsset = (asset: any) => {
  emit('select', asset.url);
  showModal.value = false;
};

const calculateChecksum = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const onFileChange = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const checksum = await calculateChecksum(file);

  const response = await api.post('/media/sign', { filename: file.name, contentType: file.type });
  const { signedUrl } = response.data;

  await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  await api.post('/media', {
    filename: file.name,
    contentType: file.type,
    byte_size: file.size,
    storage_key: file.name, // This should be the key from the storage, but for now I will use the filename
    checksum,
  });

  fetchMediaAssets();
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
