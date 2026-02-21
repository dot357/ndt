export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cyan',
      neutral: 'slate'
    },
    pageHeader: {
      slots: {
        container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8'
      }
    },
    pageBody: {
      base: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-24 space-y-12'
    }
  }
})
