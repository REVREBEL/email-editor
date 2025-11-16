<template>
  <div id="example">
    <div class="container">
      <div id="bar">
        <h1>REBEL EDITOR</h1>

        <button @click="setDisplayMode('email')">Email</button>
        <button @click="setDisplayMode('document')">Document</button>
        <button @click="setDisplayMode('web')">Web</button>

        <button @click="saveDesign">Save Design</button>
        <button @click="exportHtml">Export HTML</button>
      </div>

      <EmailEditor
        :key="displayMode"
        ref="emailEditor"
        @load="editorLoaded"
        @ready="editorReady"
        :options="options"
      />
    </div>
  </div>
</template>

<!-- //////////////////////*************************************** */ -->
<!-- //////////////////////*************************************** */ -->
 
<script setup lang="ts">

import { ref, computed } from "vue";
import "revrebel-fonts/rebel-fonts.css";
import EmailEditor from "../components/EmailEditor.vue";
import api from "../services/api";
import type {
  ChildComponentPublicMethods,
  SaveDesignCallback,
  ExportHtmlCallback,
} from "@/components/types";
import { brandColors, brandFonts } from '../styles/brand';
import sample from '../data/sample.json';

const emailEditor = ref<ChildComponentPublicMethods | null>(null);
const displayMode = ref('email');

const options = computed(() => ({
  projectId: import.meta.env.VITE_UNLAYER_PROJECT_ID, // Using your project ID
  locale: 'en',
  version: "latest",
  displayMode: displayMode.value,
  appearance: {
    name: 'REVREBEL',
    theme: "modern_light",
    isClassic: false,
    panels: {
      tools: {
        dock: 'right',
      },
    },
    loader: {
      url: 'https://res.cloudinary.com/revrebel/image/upload/v1758990562/RR/Favicon/revrebel_256_fgsrow.ico',
    },
  },
  features: {
    headersAndFooters: true,
    pageAnchors: true,
    blocks: true,
    colorPicker: {
      presets: Object.values(brandColors),
    },
    textEditor: {
      spellChecker: true,
      tables: true,
      inlineFontControls: true,
    },
  },
  fonts: {
    showDefaultFonts: false,
    customFonts: [
      {
        label: "Brand Primary",
        value: brandFonts.primary,
      },
      {
        label: "Brand Secondary",
        value: brandFonts.secondary,
      },
    ],
  },
}));

const setDisplayMode = (mode: string) => {
  displayMode.value = mode;
};

const editorLoaded = () => {
  // ...
};

  const editorReady = async () => {
    console.log("Editor is ready.");

    try {
      const response = await api.get('/templates/latest');
      const latestDesign = response.data.design;
      if (latestDesign) {
        emailEditor.value?.loadDesign(latestDesign);
        console.log('Loaded latest design from server.');
      } else {
        console.log('No saved design found on server, loading a blank design with custom background.');
        emailEditor.value?.loadDesign(sample);
      }
    } catch (error) {
      console.error('Error loading latest design:', error);
      emailEditor.value?.loadDesign(sample);
    }
  };

  const saveDesign = () => {
    console.log('saveDesign function called');
    emailEditor.value?.saveDesign(async (designObject: Parameters<SaveDesignCallback>[0]) => {
      console.log("saveDesign JSON:", designObject);

      try {
        await api.post('/templates', { design: designObject, name: 'New Template' });
        alert('Design saved successfully!');
      } catch (error) {
        console.error('Error saving design:', error);
        alert('Could not save the design. Please try again.');
      }
    });
  };

  const exportHtml = () => {
    emailEditor.value?.exportHtml((data: Parameters<ExportHtmlCallback>[0]) => {
      const { html } = data;
      console.log("exportHtml", html);

      // --- Example: Downloading the HTML as a file ---
      const blob = new Blob([html], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'email.html'; // The name of the downloaded file

      // This part is important to make it work in all browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

</script>

<!-- //////////////////////*************************************** */ -->
<!-- //////////////////////*************************************** */ -->


<style>

    html,
    body {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
    }

    #app,
    #example {
      height: 100%;
    }

    #example .container {
      display: flex;
      flex-direction: column;
      position: relative;
      height: 100%;
    }

    #bar {
      /* Don't grow, just take up the space needed. */
      flex-shrink: 0;
      background-color: #163666;
      color: #fff;
      padding: 10px;
      display: flex;
    }

    /* Target the div rendered by the EmailEditor component */
    .unlayer-editor {
      flex: 1; /* Grow to fill remaining space */
      min-height: 0; /* Prevent flexbox overflow issues */
    }

    #bar h1 {
      flex: 1;
      font-size: 16px;
      text-align: left;
    }

    #bar button {
      flex: 1;
      padding: 10px;
      margin-left: 10px;
      font-size: 14px;
      font-weight: bold;
      background-color: #fafafa;
      color: #163666;
      border: 0px;
      border-radius: 0.35rem;
      max-width: 150px;
      cursor: pointer;
      text-transform: uppercase;
    }

</style>
