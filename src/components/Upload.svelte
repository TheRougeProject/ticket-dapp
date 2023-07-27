<script>
  // import { onMount } from 'svelte'

  import FilePond, { registerPlugin } from 'svelte-filepond'
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
  import FilePondPluginFileEncode from 'filepond-plugin-file-encode'

  import FilePondPluginImageEditor from '@pqina/filepond-plugin-image-editor'

  import {
    openEditor,
    createDefaultImageReader,
    createDefaultImageWriter,
    processImage,
    getEditorDefaults
  } from '@pqina/pintura'

  // import registry from '$stores/registry.js'
  // import user from '$stores/user.js'

  registerPlugin(
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginFileEncode,
    FilePondPluginImageEditor
  )

  const control = {
    step: 0,
    error: null
  }

  let pond

  let name = 'filepond'

  const handleStart = () => {
    control.step = 1
    console.log('handleEnd')
  }

  const handleUploadError = (err) => {
    console.log('upload error', err)
  }

  const handleEnd = () => {
    control.step = 2

    console.log('handleEnd')
  }

  const imageEditor = {
    // used to create the editor, receives editor configuration, should return an editor instance
    createEditor: openEditor,

    // Required, used for reading the image data
    imageReader: [createDefaultImageReader],

    // optionally. can leave out when not generating a preview thumbnail and/or output image
    imageWriter: [
      // The image writer to use
      createDefaultImageWriter,
      // optional image writer instructions, this instructs the image writer to resize the image to match a width of 384 pixels
      {
        targetSize: {
          width: 128
        }
      }

      /* Uncomment when editing videos, remove above code
             () =>
             createDefaultMediaWriter(
             // Generic Media Writer options, passed to image and video writer
             {
             targetSize: {
             width: 400,
             },
             },
             [
             // For handling images
             createDefaultImageWriter(),

             // For handling videos
             createDefaultVideoWriter({
             // Video writer instructions here
             // ...

             // Encoder to use
             encoder: createMediaStreamEncoder({
             imageStateToCanvas,
             }),
             }),
             ]
             ),
           */
    ],

    // used to generate poster images, runs an editor in the background
    imageProcessor: processImage,

    // Pintura Image Editor properties
    editorOptions: {
      // pass the editor default configuration options
      ...getEditorDefaults({
        /* Uncomment when editing videos
                 locale: { ...plugin_trim_locale_en_gb },
               */
      }),

      // we want a square crop
      imageCropAspectRatio: 1
    }
  }

  /* uncomment to preview the resulting file in the document after editing
           onpreparefile: (fileItem, file) => {
           const media = document.createElement(
           /video/.test(file.type) ? 'video' : 'img'
           );
           media.controls = true;
           media.src = URL.createObjectURL(file);
           document.body.appendChild(media);
           },
         */

  $: sizeLimit = '1MB'

  // if (!['image/gif','image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].inc>
</script>

<FilePond
  {name}
  {imageEditor}
  bind:this={pond}
  allowFileEncode={true}
  allowImageEditor={true}
  imageEditorInstantEdit={true}
  acceptedFileTypes={['image/gif', 'image/jpeg', 'image/png', 'image/webp']}
  labelFileTypeNotAllowed={'Only GIF, JPEG, PNG & WebPPDF are upported'}
  labelIdle={`<p class="my-3">Or drop/upload here your custom visual <br /> <span class="button is-small filepond--label-action my-3">Upload from device</span></p>`}
  minFileSize="1KB"
  maxFileSize={sizeLimit}
  labelMinFileSizeExceeded="Image size too small"
  labelMaxFileSizeExceeded="Image size too large"
  allowMultiple={false}
  onaddfilestart={handleStart}
  onerror={handleUploadError}
  onprocessfiles={handleEnd}
  allowRemove={true}
  labelTapToUndo="Tap to change image" />
<p class="has-text-centered is-size-7 py-1">
  min. size 768x432 pixels, 16:9 ratio
</p>

<span class="filepond--drop-label" />

<style lang="scss" global>
  @import '@pqina/pintura/pintura.css';
  @import 'filepond/dist/filepond.css';
  @import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

  .filepond--drop-label {
    background-color: #fff;
    padding: 20px;
    color: rgb(153, 0, 0) !important;
    font-size: 0.75rem !important;
    height: 10em;
  }
</style>
