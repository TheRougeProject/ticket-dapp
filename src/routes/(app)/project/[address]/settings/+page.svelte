<script>
  import { goto } from '$app/navigation'

  import project from '$stores/project.js'

  import ConfirmUnload from '$components/popins/ConfirmUnload.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  export let forget = async () => {
    project.rm(address)
    goto('/')
  }
</script>

<h2 class="title">Settings</h2>

<article class="message is-primary">
  <div class="message-body">
    <h3 class="title is-size-4 mb-4">Unload & forget this event</h3>
    <div class="content">
      <p>
        Since your event has already been deployed on-chain, it can not be
        deleted. But you may choose to unload it from the event manager. It will
        be forgotten so it doesn't get listed automatically on this device when
        you sign-in. (you can always load it back later, it's on the
        blockchain!)
      </p>
    </div>

    <div class="level-right">
      <div class="level-item">
        <ConfirmUnload let:activate {p} on:confirm={forget}>
          <h3>
            <button class="button is-primary" on:click={activate}
              >Unload & Forget</button>
          </h3>
        </ConfirmUnload>
      </div>
    </div>
  </div>
</article>
