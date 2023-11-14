<script>
  import { onMount } from 'svelte'

  import { signerAddress } from 'ethers-svelte'

  import blockchain from '$lib/blockchain.js'

  // import Icon from '$components/Icon.svelte'

  export let data
  $: ({ chain } = data)

  const events = [   ]

  onMount(async () => {
    blockchain.initFallback(chain)
    if ($signerAddress) blockchain.switchChain(chain)
  })

</script>

<section class="section content">

  <h2 class="title">Introducing the Rouge Ticket Hub 🌍✨</h2>

  <p>
    We are delighted to announce the forthcoming launch of the Rouge Ticket
    Hub—a central platform designed to celebrate the power of Rouge Ticket event
    management. At Rouge, we believe in empowering event organizers and
    attendees through transparency and community-driven efforts.
  </p>

  <h2 class="subtitle mt-3">What Awaits You?</h2>

  <p>On this page, you will be able to explore a meticulously curated selection of outstanding events, sourced from around the globe.
    Discover both local gems and international extravaganzas, all united under the banner of open source innovation.
    Immerse yourself in a diverse world of entertainment, spanning concerts, conferences, festivals, and more.
    Connect with like-minded attendees, share experiences, and foster new connections within our thriving community.
    Seamlessly book tickets and stay informed with real-time event updates.
  </p>

  <p>
    Our dev team is diligently working to bring you this remarkable feature,
    built on the principles of open source collaboration and innovation. We are
    excited to offer you a platform that reflects our commitment to
    community-driven progress.
  </p>

  <p>Keep a close watch on this space and our Discord for further details.
  </p>


  <!--

    <div class="level">
      <div class="level-left">
        <h2 class="title">Ticket on {$chainData.name}</h2>
      </div>
    </div>


🚀 Exciting News! Introducing the Rouge Ticket Hub 🚀

We are delighted to announce the forthcoming launch of the Rouge Ticket Hub—a central platform designed to celebrate the power of open source event management. At Rouge, we believe in empowering event organizers and attendees through transparency and community-driven efforts.

🌟 What Awaits You? 🌟

    Explore a meticulously curated selection of outstanding events, sourced from around the globe.
    Discover both local gems and international extravaganzas, all united under the banner of open source innovation.
    Immerse yourself in a diverse world of entertainment, spanning concerts, conferences, festivals, and more.
    Connect with like-minded attendees, share experiences, and foster new connections within our thriving community.
    Seamlessly book tickets and stay informed with real-time event updates.

Our dedicated team is diligently working to bring you this remarkable feature, built on the principles of open source collaboration and innovation. We are excited to offer you a platform that reflects our commitment to community-driven progress.

Stay tuned for updates, as we embark on this journey together towards a world of unforgettable events. Your next extraordinary experience is just around the corner, brought to you by the open source spirit of Rouge Ticket Hub! 🌍✨

Keep a close watch on this space for further details, and in the meantime, prepare to be inspired by the incredible adventures that lie ahead.

 -->



</section>
