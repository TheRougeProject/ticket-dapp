export const resize = (node, updater) => {
  const runUpdate = () => updater(node)

  runUpdate()

  window.addEventListener('resize', runUpdate)

  return {
    destroy() {
      window.removeEventListener('resize', runUpdate)
    }
  }
}
