const defaultOptions = {
  timeFormat: 'HH:mm',
  editTimeManually: false,
  color: 'primary',
  isRange: false,
  lang: 'en-US', // internationalization
  startTime: undefined,
  endTime: undefined,
  minTime: null,
  maxTime: null,
  minuteSteps: 5,
  dateFormater: (d) => (d ? d : '')
}

export default defaultOptions
