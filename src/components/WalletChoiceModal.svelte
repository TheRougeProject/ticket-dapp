<script>
  import { createEventDispatcher } from 'svelte'
  import Modal from './Modal.svelte'
  import { isChoosing } from '$lib/utils'

  const dispatch = createEventDispatcher()
  export let isOpen = false
  let modal

  const handleChoice = (choice) => {
    dispatch('choice', choice)
    isOpen = false
    isChoosing.set(false)
  }
</script>

<Modal
  bind:active={isOpen}
  bind:this={modal}
  on:close={() => {
    isChoosing.set(false)
    isOpen = false
  }}
  ><div class="content is-flex is-justify-content-center">
    <div class="box is-flex">
      <button class="button is-primary" on:click={() => handleChoice('eoa')}
        >Connect with EOA</button
      >
      <button class="button is-info" on:click={() => handleChoice('existing')}
        >Connect with Existing Wallet</button
      >
    </div>
  </div>
</Modal>

<style>
  .box {
    gap: 5px;
  }
</style>
