<template>

  <div id="example">
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
        :options="options" />

    </div>
  </div>
</template>


//////////////////////*************************************** */
//////////////////////*************************************** */
<script setup lang="ts">
//////////////////////*************************************** */
//////////////////////*************************************** */

  import { ref } from "vue";
  import EmailEditor from "../components/EmailEditor.vue";
  import sample from "../data/sample.json";
  import type {
    ChildComponentPublicMethods,
    SaveDesignCallback,
    ExportHtmlCallback,
  } from "@/components/types";

//////////////////////*************************************** */
//////////////////////*************************************** */

const emailEditor = ref<ChildComponentPublicMethods | null>(null);

//////////////////////*************************************** */
//////////////////////*************************************** */

  const options = {
      projectId: 187691, // Using your project ID
      locale: 'en',
      version: "latest",


  /**  unlayer.init({
          customCSS: 'https://example.com/custom-styles.css',
        });
  
        unlayer.init({
          customJS: '//cdn.muicss.com/mui-0.9.28/js/mui.min.js',
        });
  
        unlayer.loadBlank({
          backgroundColor: '#e7e7e7',
        });
  
        unlayer.init({
          features: {
          audit: true,
        },
  
        unlayer.setValidator(function (data) {
          const { html, design, defaultErrors } = data;
  
          return [
            {
              id: 'DESIGN_CUSTOM_ERROR',
              icon: 'fa-smile',
              severity: 'WARNING',
              title: 'This is a custom error',
              description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce pretium non lectus venenatis lacinia. Fusce vitae venenatis nibh. Sed laoreet ornare lorem, a convallis nibh suscipit eu. Ut dictum commodo velit vitae interdum.',
            },
          ].concat(defaultErrors);
        });
  
        unlayer.setToolValidator('button', function (data) {
          const { defaultErrors, values } = data;
  
          return [
            {
              id: 'CUSTOM_ERROR',
              icon: 'fa-smile',
              severity: 'WARNING',
              title: 'This is a custom button error',
              description: `Lorem ipsum dolor sit amet ${values?.text}.`,
            },
          ].concat(defaultErrors);
        });
  
        unlayer.audit(function (data) {
          console.log(data);
  
          // {
          //   status: "PASS",
          //   errors: [],
          // }
  
          // {
          //   status: "FAIL",
          //   errors: [{...}],
          // }
        });
  
        unlayer.registerCallback('image', function (file, done) {
          // Handle file upload here
        });
  
        unlayer.registerCallback('image', function (file, done) {
          // File upload code goes here
          done({ progress: 10 }); // Updates the progress bar to 10%
        });
  
        unlayer.registerCallback('image', function (file, done) {
          // File upload code goes here
          done({ progress: 100, url: 'URL OF THE FILE' });
        });
  
        unlayer.registerCallback('image', function (file, done) {
          var data = new FormData();
          data.append('file', file.attachments[0]);
  
          fetch('/uploads', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
            },
            body: data,
          })
            .then((response) => {
              // Make sure the response was valid
              if (response.status >= 200 && response.status < 300) {
                return response;
              } else {
                var error = new Error(response.statusText);
                error.response = response;
                throw error;
              }
            })
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              // Pass the URL back to Unlayer to mark this upload as completed
              done({ progress: 100, url: data.filelink });
            });
        });
  
        unlayer.registerProvider('userUploads', function (params, done) {
          // Load images from your server here...
          var images = [
            {
              id: Date.now() + i,
              location: 'https://picsum.photos/id/1/500',
              width: 500,
              height: 500,
              contentType: 'image/png',
              source: 'user',
            },
            {
              id: Date.now() + i,
              location: 'https://picsum.photos/id/2/500',
              width: 500,
              height: 500,
              contentType: 'image/png',
              source: 'user',
            },
          ];
  
          done(images);
        });
  
        unlayer.addEventListener('image:uploaded', function (data) {
          var image = data.image;
          var url = image.url;
          var width = image.width;
          var height = image.height;
  
          // Save image info to your custom database here
        });
  
        unlayer.loadTemplate(1); 
  
        // VIDEO
        unlayer.init({
          tools: {
            video: {
              enabled: false,
            },
          },
        });

        // Default Color Groups
        unlayer.init({
          features: {
            colorPicker: {
              colors: [
                {
                  id: 'brand_colors',
                  colors: ['pink'],
                  default: true,
                },
              ],
            },
          },
        });

  
  });
  
  
  unlayer.init({
    features: {
      svgImageUpload: true,
    },
  });
  
  unlayer.init({
    features: {
      userUploads: {
        enabled: true,
      },
    },
  });
  
  unlayer.init({
    designMode: 'edit', // default value is 'live'
  });
  
  unlayer.init({
    features: {
      userUploads: {
        enabled: true,
        search: true,
      },
    },
  });
  
  
  unlayer.init({
    tools: {
      social: {
        enabled: true,
      },
    },
  });
  
  unlayer.init({
    tools: {
      social: {
        properties: {
          icons: {
            value: {
              iconType: 'squared',
              icons: [
                { name: 'Facebook', url: 'https://facebook.com/' },
                { name: 'Twitter', url: 'https://twitter.com/' },
              ],
            },
          },
        },
      },
    },
  });
  
  //Icon Spacing
  unlayer.init({
    tools: {
      social: {
        properties: {
          spacing: {
            value: 5,
          },
        },
      },
    },
  });
  
  //Alignment
  unlayer.init({
    tools: {
      social: {
        properties: {
          align: {
            value: 'center',
          },
        },
      },
    },
  });
  
  //Container Padding
  unlayer.init({
    tools: {
      social: {
        properties: {
          containerPadding: {
            value: '10px',
          },
        },
      },
    },
  });
  
  
  //Default Text
  unlayer.init({
    tools: {
      text: {
        properties: {
          text: {
            value:
              '<p style="line-height: 140%;">This is a new Text block. Change the text.</p>',
          },
        },
      },
    },
  });
  
  
  // Color
  unlayer.init({
    tools: {
      text: {
        properties: {
          color: {
            editor: {
              defaultValue: '#000000',
            },
          },
        },
      },
    },
  });
  
  // Line Height
  unlayer.init({
    tools: {
      text: {
        properties: {
          lineHeight: {
            editor: {
              defaultValue: '140%',
            },
          },
        },
      },
    },
  });
  
  // Font Family
  unlayer.init({
    tools: {
      text: {
        properties: {
          fontFamily: {
            editor: {
              defaultValue: {
                value: "'Pacifico',cursive",
              },
            },
          },
        },
      },
    },
  });


  // Initializing Merge Tags
unlayer.init({
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
});


unlayer.init({
  features: {
    styleGuide: true,
  },
});


unlayer.setStyleGuide({
  tools: {
    button: {
      styles: {
        primary: {
          label: "Primary Button",
          values: {
            buttonColors: {
              color: "#ffffff",
              backgroundColor: "#000000",
              hoverColor: "#ffffff",
              hoverBackgroundColor: "#000000",
            },
            border: {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#000000",
              borderLeftWidth: "1px",
              borderLeftStyle: "solid",
              borderLeftColor: "#000000",
              borderRightWidth: "1px",
              borderRightStyle: "solid",
              borderRightColor: "#000000",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "#000000",
            },
          },
        },
        secondary: {
          label: "Secondary Button",
          values: {
            buttonColors: {
              color: "#000000",
              backgroundColor: "#ffffff",
              hoverColor: "#000000",
              hoverBackgroundColor: "#ffffff",
            },
            border: {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#000000",
              borderLeftWidth: "1px",
              borderLeftStyle: "solid",
              borderLeftColor: "#000000",
              borderRightWidth: "1px",
              borderRightStyle: "solid",
              borderRightColor: "#000000",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "#000000",
            },
          },
        },
      },
    },
});


  
  */


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
          },
        // Custom Color Groups
          colorPicker: {
            colors: [
              {
                id: 'Core Rebel',
                label: 'Dark Mode',
                colors: ['#fafafa', '#71c9c5', '#163666'],
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
              { name: 'my_button',
                text: 'My Button',
                icon: 'bookmark',
                onSetup: () => {}, 
                onAction: (data, callback) => { console.log(data.text); callback(data.text + ' Updated'); }, 
              },
              { name: 'my_svg_button',
                text: 'My SVG Button',
                icon: '<svg />', // Insert your custom SVG here
                onSetup: () => { },
                onAction: () => { },
              },
            ],
          },
        },

      fonts: {
      //|||||||||||||||||||||||||||
        showDefaultFonts: true,
        //|||||||||||||||||||||||||||
        customFonts: [
          { label: 'Barlow',
            value: '"Barlow", sans-serif',
            url: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,800;1,800;0,900;1,900', // url is required, even for system fonts
            weights: [ { label: 'Extra Bold', value: 800 }, { label: 'Black', value: 900 }, ],
          },
          { label: 'Khand',
            value: '"Khand", sans-serif',
            url: 'https://fonts.googleapis.com/css2?family=Khand:wght@500;600;700',
            weights: [{ label: 'Medium', value: 500 }, { label: 'Semi Bold', value: 600 }, { label: 'Bold', value: 700 },
            ],
          },
          { label: 'Public Sans',
            value: '"Public Sans", sans-serif',
            url: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap',
            weights: [
              { label: 'Light', value: 300 },
              { label: 'Regular', value: 400 },
              { label: 'Medium', value: 500 },
              { label: 'Semi Bold', value: 600 },
            ],
          },
          { label: 'General Sans',
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

<!-- //////////////////////*************************************** */ -->