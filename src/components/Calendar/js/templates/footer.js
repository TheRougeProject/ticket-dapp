export default (data) => {
  return `<div class="datetimepicker-footer">
		<button type="button" class="datetimepicker-footer-today button is-outlined is-info mt-1 is-small">${
      data.icons.today ? data.icons.today : ''
    }${data.todayLabel}</button>
		<button type="button" class="datetimepicker-footer-clear button is-outlined is-info mt-1 is-small">${
      data.icons.clear ? data.icons.clear : ''
    }${data.clearLabel}</button>
		<button type="button" class="datetimepicker-footer-cancel button is-info mt-1 is-small ${
      data.displayMode === 'inline' ? 'is-hidden' : ''
    }">${data.icons.cancel ? data.icons.cancel : ''}${data.cancelLabel}</button>
		<button type="button" class="datetimepicker-footer-validate button is-primary mt-1 is-small ${
      data.displayMode === 'inline' ? 'is-hidden' : ''
    }">${data.icons.validate ? data.icons.validate : ''}${
      data.validateLabel
    } </button>
	</div>`
}
