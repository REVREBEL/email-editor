<template>
  <div id="example">
    <div class="container">
      <div id="bar">
        <h1>REBEL EDITOR</h1>

        <button @click="saveDesign">Save Design</button>
        <button @click="exportHtml">Export HTML</button>
      </div>

      <EmailEditor
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

import { ref } from "vue";
import "revrebel-fonts/rebel-fonts.css";
import EmailEditor from "../components/EmailEditor.vue";
import { getLatestDesign, saveDesign as saveDesignApi } from "../services/api";
import sample from "../data/sample.json";
import type {
  ChildComponentPublicMethods,
  SaveDesignCallback,
  ExportHtmlCallback,
} from "../components/types";

  const emailEditor = ref<ChildComponentPublicMethods | null>(null);

  const options = {
      projectId: 187691, // Using your project ID
      locale: 'en',
    safe: true,
      version: "latest",
      displayMode: 'email',
      devices: ['desktop', 'mobile'],
      appearance: {
        name: 'revrebel',
          theme: "modern_light",
          isClassic: false,
          //////////////////////*************************************** */
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
        styleGuide: true,
        headersAndFooters: true,
        blocks: true,
        svgImageUpload: true,
      //|||||||||||||||||||||||||||
        // Color Picker
        colorPicker: {
          presets: [
            '#163666',
            '#047c97',
            '#00a6b6',
            '#71c9c5',
            '#B2D3dE',
            '#faca78',
            '#f37d59',
            '#e05047',
            '#8e456a',
            '#fafafa',
            '#575757',
            '#2E2E2E',
          ],
          colors: [
            {
              id: 'blue_shades',
              label: 'Blue Shades',
              colors: [
                '#496999',
                '#3e5f92',
                '#33568c',
                '#274c85',
                '#1c437f',
                '#1b4079',
                '#193c72',
                '#18396c',
                '#163666',
              ],
            },
          ],
        },
        //|||||||||||||||||||||||||||
        textEditor: {
        //|||||||||||||||||||||||||||
          spellChecker: true,
          tables: true,
          inlineFontControls: true,

          customButtons: [
            {
              name: 'my_button',
              text: 'My Button',
              icon: 'bookmark',
              onSetup: () => {},
              onAction: (data: { text: string }, callback: (text: string) => void) => { console.log(data.text); callback(data.text + ' Updated'); },
            },
            {
              name: 'my_svg_button',
              text: 'My SVG Button',
              icon: '<svg />', // Insert your custom SVG here
              onSetup: () => { },
              onAction: () => { },
            },
          ],
        }
      },

    fonts: {
    //|||||||||||||||||||||||||||
      showDefaultFonts: true,
      //|||||||||||||||||||||||||||
      customFonts: [
        {
          label: "Barlow",
          value: '"Barlow", sans-serif',
        },
        {
          label: "Khand",
          value: '"Khand", sans-serif',
        },
        {
          label: "Fira Code",
          value: '"Fira Code", monospace',
        },
        {
          label: "General Sans",
          value: '"General Sans", sans-serif',
        },
        {
          label: "Supreme",
          value: '"Supreme", sans-serif',
        },
        {
          label: "Pacifico",
          value: '"Pacifico", cursive',
        },
      ],
    },
    mergeTags: {
      first_name: {
        name: 'First Name',
        value: '{{first_name}}',
        sample: 'John',
      },
      last_name: {
        name: 'Last Name',
        value: '{{last_name}}',
        sample: 'Doe',
      },
    },
  };

  // called when the editor is created
  const editorLoaded = () => {
    // The 'load' event is good for knowing the editor instance is created,
    // but 'ready' is better for loading a design.
    console.log('Editor instance has been created.');
  };

  // called when the editor has finished loading and is ready to be used
  const editorReady = async () => {
    console.log("Editor is ready.");

    const latestDesign = await getLatestDesign();
    if (latestDesign) {
      emailEditor.value?.loadDesign(latestDesign);
      console.log('Loaded latest design from server.');
    } else {
      console.log('No saved design found on server, loading a blank design with custom background.');
      emailEditor.value?.loadDesign(sample);
    }
  };

  const saveDesign = () => {
    console.log('saveDesign function called');
    emailEditor.value?.saveDesign(async (designObject: Parameters<SaveDesignCallback>[0]) => {
      console.log("saveDesign JSON:", designObject);

      try {
        await saveDesignApi(designObject);
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
