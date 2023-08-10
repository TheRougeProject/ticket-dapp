<script>
  import { createEventDispatcher } from 'svelte'

  import Cropper from '$components/Cropper.svelte'

  import FilePond, { registerPlugin } from 'svelte-filepond'
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview'

  // import registry from '$stores/registry.js'
  // import user from '$stores/user.js'

  registerPlugin(
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview
  )
  /* eslint-disable */

  export let minSize
  export let forceRatio = true

  // eslint-disable-next-line no-unused-vars
  $: minWidth = minSize.split('x')[0]
  // eslint-disable-next-line no-unused-vars
  $: minHeight = minSize.split('x')[1]

  const dispatch = createEventDispatcher()

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
      console.log(pond, fieldName, file, metadata, file.name)

      let reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = async (e) => {
        // TODO get file size
        //if ()

        // if (!['image/gif','image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].inc>
        // TODO if svg, no resize ...

        // if ratio ok no reisze ?
        //         // console.log(target.width, target.height)
        //         if (!['image/svg+xml'] && target.width < 768) {
        //           control.error.visual = `Image dimensions (${target.width} x ${target.height} px) is too small: a minimum 768px width is required`
        //           return
        //         }
        //         if (!['image/svg+xml'] && target.height < 432) {
        //           control.error.visual = `Image dimensions (${target.width} x ${target.height} px) is too small: a minimum 432px height is required`
        //           return
        //         }

        // console.log(e.target.result)
        try {
          const resized = await new Promise((resolve, reject) => {
            callback = { resolve, reject }
            src = e.target.result
          })
          src = null
          load('ok')
          dispatch('success', { src: resized })
          pond.removeFiles()
        } catch (err) {
          src = null
          error('oh no')
          dispatch('failure')
          pond.removeFiles()
        }
      }

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

  let src
  let callback
</script>

{#if src}
  <Cropper active={true} {minSize} {forceRatio} {callback} {src} />
{/if}

<FilePond
  {name}
  {server}
  bind:this={pond}
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
  FilePondPlugin="Error"
  allowRemove={true}
  labelTapToUndo="Tap to change image" />

<style lang="scss" global>
  @import 'filepond/dist/filepond.css';
  @import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

  .filepond--panel-root {
    background-color: transparent !important;
  }
  .filepond--credits {
    right: unset;
    left: 0;
    margin-top: 10px;
  }

  .filepond--drop-label {
    background-color: #f5f5f5;
    border: 2px dashed #ddd;
    padding: 5px;
    color: rgb(153, 0, 0) !important;
    font-size: 0.75rem !important;
    height: auto;
    width: auto;
    top: unset;
    right: unset;
    left: unset;
  }
</style>
