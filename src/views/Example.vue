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
  import EmailEditor from "../components/EmailEditor.vue";
  import sample from "../data/sample.json";
  import type {
    ChildComponentPublicMethods,
    SaveDesignCallback,
    ExportHtmlCallback,
  } from "@/components/types";

  const emailEditor = ref<ChildComponentPublicMethods | null>(null);

  const options = {
      projectId: 187691, // Using your project ID
      locale: 'en',
      version: "latest",
      appearance: {
          name: 'REVREBEL',
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
          label: 'Barlow',
          value: '"Barlow", sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,800;1,800;0,900;1,900', // url is required, even for system fonts
          weights: [{ label: 'Extra Bold', value: 800 }, { label: 'Black', value: 900 }],
        },
        {
          label: 'Khand',
          value: '"Khand", sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Khand:wght@500;600;700',
          weights: [{ label: 'Medium', value: 500 }, { label: 'Semi Bold', value: 600 }, { label: 'Bold', value: 700 }],
        },
        {
          label: 'Public Sans',
          value: '"Public Sans", sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap',
          weights: [
            { label: 'Light', value: 300 },
            { label: 'Regular', value: 400 },
            { label: 'Medium', value: 500 },
            { label: 'Semi Bold', value: 600 },
          ],
        },
        {
          label: 'General Sans',
          value: "'General Sans', sans-serif",
          url: 'https://fonts.cdnfonts.com/css/general-sans',
          weights: [
            { label: 'Light', value: 300 },
            { label: 'Regular', value: 400 },
            { label: 'Medium', value: 500 },
            { label: 'Semi Bold', value: 500 },
          ],
        },
      ],
    },
  };

  // called when the editor is created
  const editorLoaded = () => {
    emailEditor.value?.loadDesign(sample);
  }

  // called when the editor has finished loading
  const editorReady = () => {
    console.log("editorReady");
  }

  const saveDesign = () => {
    emailEditor.value?.saveDesign((design: Parameters<SaveDesignCallback>[0]) => {
      console.log("saveDesign", design);
    });
  }

  const exportHtml = () => {
    emailEditor.value?.exportHtml((data: Parameters<ExportHtmlCallback>[0]) => {
      console.log("exportHtml", data);
    });
  }

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
