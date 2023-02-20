<script>
  import TxAction from '$components/TxAction/index.svelte'
  import TxActionButton from '$components/TxAction/TxActionButton.svelte'
  import TxActionFeedback from '$components/TxAction/TxActionFeedback.svelte'

  export let submitCtx
  export let disabled
  export let autoReset

  export let disabledHelp

  let importedClasses = ''
  export { importedClasses as class }

  let action

  export const reset = () => action.reset()
</script>

<TxAction
  bind:this={action}
  {submitCtx}
  {disabled}
  {autoReset}
  on:success
  on:error>
  <div class="field">
    <TxActionButton class="button is-primary {importedClasses}"
      ><slot /></TxActionButton>
    <p class="help">
      <TxActionFeedback {disabledHelp} />
    </p>
  </div>
</TxAction>
