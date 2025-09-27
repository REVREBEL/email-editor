<template>
  <div id="example">
    <div class="container">
      <div id="bar">
        <h1>Vue Email Editor</h1>

        <button v-on:click="saveDesign">Save Design</button>
        <button v-on:click="exportHtml">Export HTML</button>
      </div>

      <EmailEditor
        :options="options"
        :min-height="minHeight"
        ref="emailEditor"
        v-on:load="editorLoaded"
        v-on:ready="editorReady"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EmailEditor from '../components/EmailEditor.vue';
import { EmailEditorProps } from '../components/types';
import sample from '../data/sample.json';

type EmailEditorInstance = InstanceType<typeof EmailEditor>;

export default defineComponent({
  name: 'exampleView',
  components: {
    EmailEditor,
  },
  data(): {
    options: EmailEditorProps['options'];
    minHeight: EmailEditorProps['minHeight'];
  } {
    return {
      minHeight: '1000px',
      options: {
        locale: 'en',
        projectId: 187691, // Using your project ID
        appearance: {
          // <-- The user's selection
          theme: 'dark',
          panels: {
            tools: {
              dock: 'right',
            },
          },
        }, //
        version: 'latest',
        features: {
          textEditor: {
            spellChecker: true,
            tables: true, // Enable tables in the text editor
            inlineFontControls: true, // Enable inline font controls in the text editor
            customButtons: [
              {
                name: 'my_button', // Unique identifier for the button
                text: 'My Button', // The label that will appear on the button
                icon: 'bookmark', // Icon that will appear on the button (optional)
                onSetup: () => {}, // Function executed when the button is set up
                onAction: (
                  data: { text: string },
                  callback: (text: string) => void
                ) => {
                  console.log(data.text); // Log or manipulate text editor data
                  callback(data.text + ' Updated'); // Perform action and update the text
                },
              },
              {
                name: 'my_svg_button',
                text: 'My Button',
                icon: '<svg />', // Insert your custom SVG here
                onSetup: () => {},
                onAction: () => {},
              },
            ],
          },
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
          },
        },
        tools: {
          image: {
            enabled: true, // Example: ensure image tool is enabled
          },
        },
        fonts: {
          showDefaultFonts: true,
          customFonts: [
            {
              label: 'Barlow',
              value: '"Barlow", sans-serif',
              url: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,800;1,800;0,900;1,900', // url is required, even for system fonts
              weights: [
                { label: 'Extra Bold', value: 800 },
                { label: 'Black', value: 900 },
              ],
            },
            {
              label: 'Khand',
              value: '"Khand", sans-serif',
              url: 'https://fonts.googleapis.com/css2?family=Khand:wght@500;600;700',
              weights: [
                { label: 'Medium', value: 500 },
                { label: 'Semi Bold', value: 600 },
                { label: 'Bold', value: 700 },
              ],
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
      },
    };
  },
  methods: {
    // called when the editor is created
    editorLoaded() {
      (this.$refs.emailEditor as any)?.loadDesign(sample);
    },
    // called when the editor has finished loading
    editorReady() {
      console.log('editorReady');
    },
    saveDesign() {
      (this.$refs.emailEditor as any)?.saveDesign((design: any) => {
        console.log('saveDesign', design);
      });
    },
    exportHtml() {
      (this.$refs.emailEditor as any)?.exportHtml((data: any) => {
        console.log('exportHtml', data);
      });
    },
  },
});
</script>

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
  flex: 1;
  background-color: #163666;
  color: #fff;
  padding: 10px;
  display: flex;
  max-height: 40px;
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
