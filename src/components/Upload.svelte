<script>
  // import { onMount } from 'svelte'

  import FilePond, { registerPlugin } from 'svelte-filepond'
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
  import FilePondPluginFileEncode from 'filepond-plugin-file-encode'

  // import registry from '$stores/registry.js'
  // import user from '$stores/user.js'

  registerPlugin(
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginFileEncode
  )

  const control = {
    step: 0,
    error: null
  }

  let pond

  let name = 'filepond'

  const handleStart = () => {
    control.step = 1
    console.log('handleStart')
  }

  const handleUploadError = (err) => {
    console.log('upload error', err)
  }

  const handleEnd = async () => {
    control.step = 2
    console.log('handleEnd')
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

  const server = {
    process: (
      fieldName,
      file,
      metadata,
      load,
      error,
      progress,
      abort /* transfer, options */
    ) => {
      // fieldName is the name of the input field
      // file is the actual file object to send
      const formData = new FormData()
      formData.append(fieldName, file, file.name)

      // const request = new XMLHttpRequest();
      // request.open('POST', 'url-to-api');

      console.log(pond, fieldName, file, file.name)
      let reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = (e) => {
        console.log(e)
      }

      // Should call the progress method to update the progress to 100% before calling load
      // Setting computable to false switches the loading indicator to infinite mode
      // request.upload.onprogress = (e) => {
      //     progress(e.lengthComputable, e.loaded, e.total);
      // };

      load('ok 1')

      //error('oh no');

      // Should expose an abort method so the request can be cancelled
      return {
        abort: () => {
          // This function is entered if the user has tapped the cancel button
          //request.abort();

          // Let FilePond know the request has been cancelled
          abort()
        }
      }
    }
  }

  // if (!['image/gif','image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].inc>
</script>

<FilePond
  {name}
  {server}
  bind:this={pond}
  allowFileEncode={true}
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
