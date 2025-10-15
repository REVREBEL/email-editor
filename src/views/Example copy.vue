<template>
  <div id="rebel">
    <div class="container">
      <div id="bar">
        <h1>REBEL Editor</h1>

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
  appearance: {
    theme: "modern_light",
  },
  version: "latest",
};

// called when the editor is created
const editorLoaded = () => {
  emailEditor.value?.loadDesign(sample);
};

// called when the editor has finished loading
const editorReady = () => {
  console.log("editorReady");
};

const saveDesign = () => {
  emailEditor.value?.saveDesign((design: Parameters<SaveDesignCallback>[0]) => {
    console.log("saveDesign", design);
  });
};

const exportHtml = () => {
  emailEditor.value?.exportHtml((data: Parameters<ExportHtmlCallback>[0]) => {
    console.log("exportHtml", data);
  });
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
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
  background-color: #40b883;
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
  background-color: #000;
  color: #fff;
  border: 0px;
  max-width: 150px;
  cursor: pointer;
}
</style>
