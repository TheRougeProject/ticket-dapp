<script>
</script>

<div class="box is-slate">
  <div class="columns is-vcentered">
    <div class="column">
      <slot />
    </div>

    <div class="column">
      <slot name="info" />
    </div>

    <div class="column is-one-fourth has-text-right">
      <slot name="actions" />
    </div>
  </div>
</div>
