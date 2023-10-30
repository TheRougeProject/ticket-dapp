<script>
  import notifier from '$stores/notifier'
  //import settings from '$stores/settings'

  export let show = true // $settings.notify

  const handleDismiss = (message) => {
    notifier.dismiss(message)

    // guard to close popup when there are no more messages
    if ($notifier.length === 0) {
      //show = false
    }
  }

  const toggle = () => {
    // don't show popup when no messages
    if ($notifier.length === 0) {
      show = false
    } else {
      show = !show
    }
  }

  const clearAll = () => {
    notifier.clear()
  }

  // TODO auto disappear notify
</script>

<ul class="notifications">
  {#each $notifier as message}
    <li>
      <div class="notification is-warning">
        <button class="delete" on:click={() => handleDismiss(message)} />
        <p>{message.title}</p>
        {#if message.htmlDeck}
          <p>{@html message.htmlDeck}</p>
        {:else}
          <p>{message.deck}</p>
        {/if}
      </div>
    </li>
  {/each}
</ul>

{#if false && $notifier.length > 1}
  <button class="" on:click={clearAll}>Clear all</button>
{/if}

<style lang="scss">
  .notifications {
    padding: 0;
    margin: 0;
    list-style-type: none;
    position: fixed;
    z-index: 10000;

    left: 0.5em;
    top: 0.5em;
    li {
      width: 320px;
      margin-bottom: 0.5em;
      p {
        margin: 0;
        margin-bottom: 0.2em;
        overflow: hidden;
        a {
          color: inherit;
        }
      }
    }
  }
</style>
