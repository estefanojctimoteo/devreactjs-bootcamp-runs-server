const login = ({ db, jwt, jwtSecret }) => async(req, res) => {
  const users = await db('users').select().where('email', req.body.email)
  if (users.length === 1) {
    if (users[0].passwd === req.body.passwd) {
      const keepmeloggedin = req.body.keepmeloggedin
      const { id, name, email, role, unit, timezone } = users[0]
      const user = {
        id, name, email, role, unit, timezone, keepmeloggedin
      }
      const token = jwt.sign(user, jwtSecret)
      res.send({ token })
    } else {
      res.send({ error: true, message: 'wrong credentials' })
    }
  } else {
    res.send({ error: true, message: 'wrong credentials' })
  }
}
const get = ({ db }) => async(req, res) => {
  const { user } = res.locals
  if (user.role === 'admin') {
    const users = await db('users').select()
    res.send(users)
  } else {
    const users = await db('users').select().where('email', user.email)
    res.send(users)
  }
}
const getMe = ({ db }) => async(req, res) => {
  const userDB = await db('users').select().where('id', res.locals.user.id)
  res.send(userDB[0])
}
const getOne = ({ db }) => async(req, res) => {
  const { user } = res.locals
  let id = req.params.id
  if (user.role === 'user' && id != user.id) {
    res.status(401)
    res.send({ error: true })
  } else {
    const userDB = await db('users').select().where('id', id)
    res.send(userDB[0])
  }
}
const remove = ({ db }) => async(req, res) => {
  const { user } = res.locals
  const { id } = req.params
  if ((user.role === 'user') || (user.role === 'admin' && id == user.id)) {
    res.status(401)
    res.send({ error: true })
  } else {
    await db('users').select().where('id', id).del()
    res.send({ success: true })
  }
}

const create = ({ db }) => async(req, res) => {
  const { user } = res.locals
  const newUser = req.body
  const userToInsert = {
    name: newUser.name,
    email: newUser.email,
    passwd: newUser.passwd,
    unit: newUser.unit,
    timezone: newUser.timezone
  }
  // creating new account - without token
  if (!user) {
    userToInsert.role = 'user'
  } else if (user.role === 'user') {
    return res.send({ error: true, message: 'only admins can create new users.' })
  } else {
    userToInsert.role = newUser.role
  }

  const emailAlreadyExists = await db('users').select(db.raw('count(*) as total')).where('email', newUser.email)
  if (emailAlreadyExists[0].total > 0) {
    return res.send({ error: true, message: 'email already taken.' })
  }

  await db.insert(userToInsert).into('users')
  res.send(userToInsert)
}

const update = ({ db }) => async(req, res) => {
  const { user } = res.locals
  const updatedUser = req.body
  let { id } = req.params
  const userToUpdate = {
  }
  const fields = ['name', 'role', 'email', 'passwd', 'unit', 'timezone']
  fields.forEach(field => {
    if(updatedUser[field]){
      userToUpdate[field] = updatedUser[field]
    }
  })
  if(user.role ==='user'){
    userToUpdate['role'] = 'user'
  }
  // creating new account - without token
  if (user.role === 'user' && user.id != id) {
    return res.send({ error: true, message: 'only admins can update any user.' })
  }

  await db('users')
    .where('id', id)
    .update(userToUpdate)

  res.send(userToUpdate)
}
const find = ({ db }) => async(req, res) => {
  const { user } = res.locals
  let name = req.params.name
  if (user.role === 'admin') {
    const users = await db('users').select().where('name', 'like', '%'+name+'%')
    res.send(users)
  } else {
    const users = await db('users').select().where('email', user.email)
    res.send(users)
  }
}

const getWithDelay = ({ db }) => async(req, res) => {
  const { user } = res.locals
  let seconds = req.params.seconds

  let users =
    (user.role === 'admin') ?
      (await db('users').select()) :
      (await db('users').select().where('email', user.email))
    
  var count = 0
  var intervalObject = setInterval(function () { 
          count++; 
          if (count >= seconds) { 
              res.send(users)
              clearInterval(intervalObject)
          } 
      }, 1000)
}

module.exports = {
  login,
  get,
  getMe,
  getOne,
  find,
  getWithDelay,
  remove,
  create,
  update
}