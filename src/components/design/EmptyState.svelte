<script>
  export let svg = '/empty-box.svg'
</script>

<div class="rge-empty-state columns is-centered is-vcentered">
  <div class="column is-narrow is-half">
    <slot />
  </div>
  <div class="column is-narrow is-half has-text-centered">
    <img src={svg} class="filter-rouge" alt="Empty state" />
  </div>
</div>

<style lang="scss">
  @use '../../scss/_variables.scss';
  @use 'bulma/sass/utilities/mixins' as m;

  .rge-empty-state {
    @include m.tablet {
      img {
        padding: 2rem;
      }
      .column:nth-of-type(2) {
        order: -1;
      }
    }

    @include m.mobile {
      text-align: center !important;
      img {
        max-width: 70%;
      }
    }
  }

  .filter-rouge {
    filter: hue-rotate(-35deg) grayscale(35%) opacity(70%) brightness(100%)
      contrast(90%);

    /*
         clb: filter: hue-rotate(-20deg) grayscale(20%) opacity(40%) brightness(110%) contrast(80%);
         old: filter: grayscale(80%) hue-rotate(86deg) brightness(50%) contrast(50%);
       */
  }
</style>
