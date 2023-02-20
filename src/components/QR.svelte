<script>
  import { AwesomeQR } from 'awesome-qr'

  export let text
  export let src = undefined
  export let color = '#000'

  let importedClasses = 'is-square'
  export { importedClasses as class }

  let img

  $: if (text) {
    new AwesomeQR({
      text,
      //size: 500,
      colorDark: color
    })
      .draw()
      .then((dataURL) => {
        img.src = dataURL
        src = dataURL
      })
  }
</script>

<div>
  <figure class="image {importedClasses}">
    <img alt={text} bind:this={img} />
  </figure>
</div>

<style>
  div {
    max-width: 500px;
    margin: auto;
  }
</style>
