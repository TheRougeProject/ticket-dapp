<script>
  /* eslint-disable */
  import { onMount, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  // CALCULATE AND CLEAN UP THE ACTUAL DATES
  function atcb_date_cleanup(data) {
    // parse date+time format (default with Schema.org, but also an unofficial alternative to other implementation)
    const endpoints = ['start', 'end']
    endpoints.forEach(function (point) {
      if (data[point + 'Date'] != null) {
        // remove any milliseconds information
        data[point + 'Date'] = data[point + 'Date']
          .replace(/\..../, '')
          .replace('Z', '')
        // identify a possible time information within the date string
        let tmpSplitStartDate = data[point + 'Date'].split('T')
        if (tmpSplitStartDate[1] != null) {
          data[point + 'Date'] = tmpSplitStartDate[0]
          data[point + 'Time'] = tmpSplitStartDate[1]
        }
      }
      // remove any seconds from time information
      if (data[point + 'Time'] != null && data[point + 'Time'].length == 8) {
        let timeStr = data[point + 'Time']
        data[point + 'Time'] = timeStr.substring(0, timeStr.length - 3)
      }
    })
    return data
  }

  // SHARED FUNCTION TO GENERATE A TIME STRING
  function atcb_generate_time(
    data,
    style = 'delimiters',
    targetCal = 'general'
  ) {
    let startDate = data['startDate'].split('-')
    let endDate = data['endDate'].split('-')
    let start = ''
    let end = ''
    let allday = false
    if (data['startTime'] != null && data['endTime'] != null) {
      // Adjust for timezone, if set (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for either the TZ name or the offset)
      if (data['timeZoneOffset'] != null && data['timeZoneOffset'] != '') {
        // if we have a timezone offset given, consider it
        start = new Date(
          startDate[0] +
            '-' +
            startDate[1] +
            '-' +
            startDate[2] +
            'T' +
            data['startTime'] +
            ':00.000' +
            data['timeZoneOffset']
        )
        end = new Date(
          endDate[0] +
            '-' +
            endDate[1] +
            '-' +
            endDate[2] +
            'T' +
            data['endTime'] +
            ':00.000' +
            data['timeZoneOffset']
        )
        start = start.toISOString().replace('.000', '')
        end = end.toISOString().replace('.000', '')
        if (style == 'clean') {
          start = start.replace(/\-/g, '').replace(/\:/g, '')
          end = end.replace(/\-/g, '').replace(/\:/g, '')
        }
      } else {
        // if there is no offset, we prepare the time, assuming it is UTC formatted
        start = new Date(
          startDate[0] +
            '-' +
            startDate[1] +
            '-' +
            startDate[2] +
            'T' +
            data['startTime'] +
            ':00.000+00:00'
        )
        end = new Date(
          endDate[0] +
            '-' +
            endDate[1] +
            '-' +
            endDate[2] +
            'T' +
            data['endTime'] +
            ':00.000+00:00'
        )
        if (data['timeZone'] != null && data['timeZone'] != '') {
          // if a timezone is given, we adjust dynamically with the modern toLocaleString function
          let utcDate = new Date(
            start.toLocaleString('en-US', { timeZone: 'UTC' })
          )
          if (data['timeZone'] == 'currentBrowser') {
            data['timeZone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
          }
          let tzDate = new Date(
            start.toLocaleString('en-US', { timeZone: data['timeZone'] })
          )
          let offset = utcDate.getTime() - tzDate.getTime()
          start.setTime(start.getTime() + offset)
          end.setTime(end.getTime() + offset)
        }
        start = start.toISOString().replace('.000', '')
        end = end.toISOString().replace('.000', '')
        if (style == 'clean') {
          start = start.replace(/\-/g, '').replace(/\:/g, '')
          end = end.replace(/\-/g, '').replace(/\:/g, '')
        }
      }
    } else {
      // would be an allday event then
      allday = true
      start = new Date(Date.UTC(startDate[0], startDate[1] - 1, startDate[2]))
      let breakStart = start.toISOString().replace(/T(.+)Z/g, '')
      end = new Date(Date.UTC(endDate[0], endDate[1] - 1, endDate[2]))
      if (
        targetCal == 'google' ||
        targetCal == 'microsoft' ||
        targetCal == 'ical'
      ) {
        end.setDate(end.getDate() + 1) // increment the day by 1 for Google Calendar, iCal and Outlook
      }
      let breakEnd = end.toISOString().replace(/T(.+)Z/g, '')
      if (style == 'clean') {
        breakStart = breakStart.replace(/\-/g, '')
        breakEnd = breakEnd.replace(/\-/g, '')
      }
      start = breakStart
      end = breakEnd
    }
    let returnObject = { start: start, end: end, allday: allday }
    return returnObject
  }

  function atcb_date_calculation(dateString) {
    // replace "today" with the current date first
    let today = new Date()
    let todayString =
      today.getUTCMonth() +
      1 +
      '-' +
      today.getUTCDate() +
      '-' +
      today.getUTCFullYear()
    dateString = dateString.replace(/today/gi, todayString)
    // check for any dynamic additions and adjust
    const dateStringParts = dateString.split('+')
    const dateParts = dateStringParts[0].split('-')
    let newDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    if (dateParts[0].length < 4) {
      // backwards compatibility for version <1.5.0
      newDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1])
    }
    if (dateStringParts[1] != null && dateStringParts[1] > 0) {
      newDate.setDate(newDate.getDate() + parseInt(dateStringParts[1]))
    }
    return (
      newDate.getFullYear() +
      '-' +
      ((newDate.getMonth() + 1 < 10 ? '0' : '') + (newDate.getMonth() + 1)) +
      '-' +
      (newDate.getDate() < 10 ? '0' : '') +
      newDate.getDate()
    )
  }

  // CLEAN DATA BEFORE FURTHER VALIDATION (CONSIDERING SPECIAL RULES AND SCHEMES)
  function atcb_decorate_data(atcbConfig) {
    // cleanup different date-time formats
    atcbConfig = atcb_date_cleanup(atcbConfig)
    // calculate the real date values in case that there are some special rules included (e.g. adding days dynamically)
    atcbConfig['startDate'] = atcb_date_calculation(atcbConfig['startDate'])
    atcbConfig['endDate'] = atcb_date_calculation(atcbConfig['endDate'])

    // if no description or already decorated, return early
    if (!atcbConfig.description || atcbConfig.description_iCal)
      return atcbConfig

    // make a copy of the given argument rather than mutating in place
    const data = Object.assign({}, atcbConfig)
    // standardize any line breaks in the description and transform URLs (but keep a clean copy without the URL magic for iCal)
    data.description = data.description.replace(/<br\s*\/?>/gim, '\n')
    data.description_iCal = data.description
      .replace('[url]', '')
      .replace('[/url]', '')
    data.description = data.description.replace(
      /\[url\](.*?)\[\/url\]/g,
      "<a href='$1' target='_blank' rel='noopener'>$1</a>"
    )
    return data
  }

  const isBrowser = () => true
  const isiOS = isBrowser()
    ? new Function(
        "if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)){ return true; }else{ return false; }"
      )
    : new Function('return false;')

  // FUNCTION TO GENERATE THE GOOGLE URL
  function atcb_generate_google(data) {
    // base url
    let url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    // generate and add date
    let formattedDate = atcb_generate_time(data, 'clean', 'google')
    url += '&dates=' + formattedDate['start'] + '%2F' + formattedDate['end']
    // add details (if set)
    if (data['name'] != null && data['name'] != '') {
      url += '&text=' + encodeURIComponent(data['name'])
    }
    if (data['location'] != null && data['location'] != '') {
      url += '&location=' + encodeURIComponent(data['location'])
      // TODO: Find a better solution for the next temporary workaround.
      if (isiOS()) {
        // workaround to cover a bug, where, when using Google Calendar on an iPhone, the location is not recognized. So, for the moment, we simply add it to the descrip>
        if (data['description'] == null || data['description'] == '') {
          data['description'] = ''
        } else {
          data['description'] += '<br><br>'
        }
        data['description'] += '&#128205;: ' + data['location']
      }
    }
    if (data['description'] != null && data['description'] != '') {
      url += '&details=' + encodeURIComponent(data['description'])
    }
    window.open(url, '_blank').focus()
  }

  let data = {
    name: 'some event',
    startDate: '2022-01-14',
    endDate: '2022-01-18',
    options: [
      'Apple',
      'Google',
      'iCal',
      'Microsoft365',
      'Outlook.com',
      'MicrosoftTeams',
      'Yahoo'
    ],
    trigger: 'click',
    iCalFileName: 'Reminder-Event'
  }

  const google = (e) => {
    // validate & decorate data
    /* if (!atcb_check_required(data)) {
     *   throw new Error("data missing; see logs")
     * } */
    data = atcb_decorate_data(data)
    //if (!atcb_validate(data)) {
    //throw new Error("Invalid data; see logs")
    //}
    // atcb_open(data, button);
    atcb_generate_google(data)
    /*
       // e.preventDefault()
       atcb_action(, el)
     */
    dispatch('action')
  }
</script>

/* eslint-disable */
<slot {google} />

<style lang="scss">
  /**
 * ++++++++++++++++++++++
 * Add-to-Calendar Button
 * ++++++++++++++++++++++
 *
 * Version: 1.8.7
 * Creator: Jens Kuerschner (https://jenskuerschner.de)
 * Project: https://github.com/jekuer/add-to-calendar-button
 * License: MIT with “Commons Clause” License Condition v1.0
 *
 */

  .atcb {
    display: none;
  }

  .atcb_button_wrapper {
    display: inline-block;
    padding: 5px;
    position: relative;
  }

  .atcb_button {
    align-items: center;
    background: rgb(245, 245, 245);
    border: 1px solid rgb(210, 210, 210);
    border-radius: 6px;
    -webkit-box-shadow: 1px 2px 10px 0px rgba(0, 0, 0, 0.4);
    box-shadow: 1px 2px 10px 0px rgba(0, 0, 0, 0.4);
    color: rgb(51, 51, 51);
    cursor: pointer;
    display: flex;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    margin: 0 4px 2px 4px;
    max-width: 300px;
    min-width: 150px;
    padding: 10px 16px;
    position: relative;
    text-align: center;
    touch-action: manipulation;
    transform: translateZ(0px);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    width: auto;
    z-index: 1;
  }
  .atcb_button:focus,
  .atcb_button:hover {
    background: rgb(255, 255, 255);
  }
  @media only screen and (max-width: 575px) {
    .atcb_button {
      font-size: 14px;
    }
  }

  .atcb_button.atcb_active {
    background: rgb(255, 255, 255);
    -webkit-box-shadow: 1px 8px 12px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 1px 8px 12px 0px rgba(0, 0, 0, 0.5);
    margin: 0;
    padding: 10px 20px 12px 20px;
    transform: perspective(100px) rotateX(12deg) translateZ(1px);
    transition: margin 0.1s ease-out, padding 0.1s ease-out,
      transform 0.1s ease-out;
    z-index: 160;
  }

  .atcb_icon {
    height: 16px;
    display: inline-block;
    margin-bottom: 4px;
    margin-right: 10px;
  }
  .atcb_icon svg {
    height: 100%;
    color: rgb(51, 51, 51);
    width: auto;
  }

  .atcb_list {
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    display: block;
    font-family: Arial, Helvetica, sans-serif;
    max-width: 100%;
    padding: 0 4px;
    position: absolute;
    transform: translateZ(0px);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    width: 100%;
    min-width: 10em;
    z-index: 150;
  }

  .atcb_list.atcb_generated_button {
    animation: atcb_list_slide 0.4s ease 0.05s 1 normal forwards;
    opacity: 0;
  }
  @keyframes atcb_list_slide {
    0% {
      opacity: 0;
      transform: rotateX(-100deg);
      transform-origin: top;
    }

    100% {
      opacity: 1;
      transform: rotateX(0deg);
      transform-origin: top;
    }
  }

  .atcb_list.atcb_modal {
    position: fixed;
    width: 16em;
    left: 50%;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  .atcb_list_item {
    align-items: center;
    background: rgb(245, 245, 245);
    border: 1px solid rgb(210, 210, 210);
    -webkit-box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.3);
    box-shadow: 1px 2px 8px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    font-size: 16px;
    left: 50%;
    margin-top: -1px; /* ugly, but prevents a glitch in some cases */
    position: relative;
    padding: 13px 15px;
    text-align: left;
    transform: translate(-50%);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  .atcb_list_item:focus,
  .atcb_list_item:hover {
    background: rgb(255, 255, 255);
    -webkit-box-shadow: 1px 2px 10px 0px rgba(0, 0, 0, 0.4);
    box-shadow: 1px 2px 10px 0px rgba(0, 0, 0, 0.4);
    color: rgb(0, 0, 0);
  }
  @media only screen and (max-width: 575px) {
    .atcb_list_item {
      font-size: 14px;
    }
  }

  .atcb_list.atcb_generated_button .atcb_list_item:first-child {
    padding-top: 20px;
  }

  .atcb_list:not(.atcb_generated_button) .atcb_list_item:first-child {
    border-radius: 6px 6px 0 0;
  }

  .atcb_list_item:last-child {
    border-radius: 0 0 6px 6px;
  }

  .atcb_list_item .atcb_icon {
    margin-right: 8px;
    width: 18px;
  }

  .atcb_bgoverlay {
    animation: atcb_bgoverlay_animate 0.4s ease 0.2s 1 normal forwards;
    background: rgba(20, 20, 20, 0.2);
    bottom: 0;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
    height: 150%;
    left: 0;
    opacity: 0;
    position: fixed;
    right: 0;
    top: 0;
    transform: translateZ(-10px);
    width: 100%;
    z-index: 120;
  }
  @keyframes atcb_bgoverlay_animate {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
  .atcb_bgoverlay.atcb_click:hover {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath fill-rule='evenodd' d='M11.991.69a2.35 2.35 0 0 1 3.318-.009c.918.911.922 2.392.009 3.307l-4.009 4.014 4.013 4.018c.906.909.893 2.38-.027 3.287a2.35 2.35 0 0 1-3.307-.004l-3.985-3.99-3.993 3.997a2.35 2.35 0 0 1-3.318.009c-.918-.911-.922-2.392-.009-3.307l4.009-4.014L.678 3.98C-.228 3.072-.215 1.6.706.693a2.35 2.35 0 0 1 3.307.004l3.985 3.99z'/%3E%3C/svg%3E")
        32 32,
      pointer;
  }
</style>
