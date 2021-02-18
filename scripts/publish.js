const ghpages = require('gh-pages')

ghpages.publish('dist', { message: 'update pages' }, (err) => {
  console.log(err ? err.message : 'publish success!')
})
