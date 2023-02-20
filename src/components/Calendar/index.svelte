<script>
  /* eslint-disable */

  import { onMount, createEventDispatcher } from 'svelte'

  import bulmaCalendar from './js/index.js'

  import { formatDate } from '$lib/utils.js'

  const dispatch = createEventDispatcher()

  export let type = 'date'
  export let isRange = false
  export let error = 'date'

  let importedClasses
  export { importedClasses as class }

  export let value = []

  export let options = {
    dateFormat: 'yyyy-MM-dd',
    color: 'black',
    weekStart: 1,
    isRange,
    type,
    minuteSteps: 5,
    //showFooter: false,
    startTime: '09:00',
    //endTime,
    //displayMode: 'dialog',
    dateFormater: formatDate
  }

  let range

  onMount(() => {
    let startDate
    let endDate
    let startTime
    let endTime

    if (value && value[0]) {
      startDate = new Date(value[0])
      startTime = `${new Date(value[0]).getHours()}:${new Date(
        value[0]
      ).getMinutes()}`
    }
    if (value && value[1]) {
      endDate = new Date(value[1])
      endTime = `${new Date(value[1]).getHours()}:${new Date(
        value[1]
      ).getMinutes()}`
    }

    const instance = new bulmaCalendar(range, {
      ...options,
      startDate,
      startTime,
      endDate,
      endTime
    })

    instance.on('select', function (datepicker) {
      value = datepicker.data.value()
      dispatch('changed')
    })
  })
</script>

<div class={importedClasses} importedClasses bind:this={range} type="vdate">
  x
</div>

<style lang="scss" global>
  @import 'bulma-calendar/dist/css/bulma-calendar.css';

  .has-error {
    .datetimepicker-dummy .datetimepicker-dummy-wrapper {
      border-color: #cc998d !important;
    }
  }
</style>
