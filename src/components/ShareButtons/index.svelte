<script>
  import { browser } from '$app/environment'

  //  TODO
  // http://reddit.com/submit?phase=2&url=[URL]&title=[TITLE]

  // const WHATSAPP_GREEN = '#25D366'
  // const FACEBOOK_BLUE = '#3b5998'
  // const TWITTER_BLUE = '#00aced'
  // const TELEGRAM_BLUE = '#49a9e9'

  function isMobileOrTablet() {
    return /(android|iphone|ipad|mobile)/i.test(navigator.userAgent)
  }

  const open = ({ baseUrl, parametersObject }) => {
    const params = Object.entries(parametersObject)
      .filter(([, value]) => value ?? false)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&')
    const urlWithParameters = params === '' ? baseUrl : `${baseUrl}?${params}`
    const config = {
      height: 550,
      width: 400,
      location: 'no',
      toolbar: 'no',
      status: 'no',
      directories: 'no',
      menubar: 'no',
      scrollbars: 'yes',
      resizable: 'no',
      centerscreen: 'yes',
      chrome: 'yes'
    }
    return window.open(
      urlWithParameters,
      '',
      Object.keys(config)
        .map((key) => `${key}=${config[key]}`)
        .join(',')
    )
  }

  const telegramShare = ({ title = '', url }) => {
    const baseUrl = 'https://telegram.me/share/url'
    const parametersObject = {
      url,
      text: title
    }
    return open({ baseUrl, parametersObject })
  }

  const whatsappShare = ({ title = '', url }) => {
    const baseUrl =
      browser && isMobileOrTablet()
        ? 'https://api.whatsapp.com/send'
        : 'https://web.whatsapp.com/send'
    const parametersObject = {
      text: title ? title + ' ' + url : url
    }
    return open({ baseUrl, parametersObject })
  }

  const twitterShare = ({
    hashtags = [], // array of hashtags exclude '#' e.g. ['svelte']
    quote,
    related = [], // array of Twitter users (including '@')
    title, // text in Tweet
    url,
    via = '' // include '@' e.g. '@askRodney'
  }) => {
    const baseUrl = 'https://twitter.com/share'
    const parametersObject = {
      url,
      ...(hashtags.length > 0 ? { hashtags: hashtags.join(',') } : {}),
      quote,
      text: title,
      ...(related.length > 0 ? { related: related.join(',') } : {}),
      ...(via.length > 0 ? { via: via.slice(1) } : {})
    }
    return open({ baseUrl, parametersObject })
  }

  const facebookShare = ({ hashtag = '', quote = '', url }) => {
    const baseUrl = 'https://www.facebook.com/sharer/sharer.php'
    const parametersObject = {
      u: url,
      ...(quote !== '' ? { quote } : {}),
      ...(hashtag !== '' ? { hashtag } : {})
    }
    return open({ baseUrl, parametersObject })
  }

  const linkedinShare = ({ title = '', url }) => {
    //const FACEBOOK_BLUE = '#3b5998'
    const baseUrl = 'https://www.linkedin.com/sharing/share-offsite/'
    const parametersObject = {
      url,
      title
    }
    return open({ baseUrl, parametersObject })
  }

  export let url
  // export let slug;
  export let title

  let webShareAPISupported = browser
  const handleWebShare = async () => {
    try {
      navigator.share({
        title,
        text: `Shared from Rouge`,
        url
      })
    } catch (error) {
      webShareAPISupported = false
    }
  }

  const telegram = () => telegramShare({ title, url })
  const whatsapp = () => whatsappShare({ title, url })
  const twitter = () => twitterShare({ title, url })
  const facebook = () => facebookShare({ title, url })
  const linkedin = () => linkedinShare({ title, url })

  $: api = webShareAPISupported && navigator.share ? handleWebShare : null
</script>

<slot {telegram} {whatsapp} {twitter} {facebook} {linkedin} {api} />
