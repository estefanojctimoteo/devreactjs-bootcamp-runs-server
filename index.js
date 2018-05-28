const app = require('./app')
require('./db')

//const port = process.env.PORT || 3001

app.listen(3001, () => {
  console.log('Server running...')
})