const get = ({ db }) => async(req, res) => {
  const { user } = res.locals
  if (user.role === 'admin' && req.query.admin) {
    const runs = await       
    db.select(['runs.id', 'runs.user_id', 'runs.friendly_name', 
      'runs.duration', 'runs.created', 'runs.distance', 
      'users.email', 'users.name', 'users.passwd', 
      'users.role', 'users.timezone', 'users.unit'])
      .from('runs').leftJoin('users', 'users.id', 'runs.user_id')
    res.send({
      data: runs,
      pagination: {
        message: 'soon :)'
      }
    })
  } else {
    const runs = await 
    db.select(['runs.id', 'runs.user_id', 'runs.friendly_name', 
               'runs.duration', 'runs.created', 'runs.distance', 
               'users.email', 'users.name', 'users.passwd', 
               'users.role', 'users.timezone', 'users.unit'])
      .from('runs').leftJoin('users', 'users.id', 'runs.user_id')
      .where('user_id', user.id)
    res.send({
      data: runs,
      pagination: {
        message: 'soon :)'
      }
    })
  }
}

const getOne = ({ db }) => async(req, res) => {
  const { user } = res.locals
  let id = req.params.id
  const run = await db('runs').select().where('id', id)
  if ((run.length === 0) || (user.role === 'user' && run[0].user_id != user.id)) {
    res.status(401)
    return res.send({ error: true })
  }
  res.send(run[0])
}
const remove = ({ db }) => async(req, res) => {
  const { user } = res.locals
  const { id } = req.params
  const run = await db('runs').select().where('id', id)
console.log(user)
  if ((run.length === 0) || (user.role === 'user' && run[0].user_id !== user.id)) {
    res.status(401)
    res.send({ error: true })
  } else {
    await db('runs').select().where('id', id).del()
    res.send({ success: true })
  }
}

const create = ({ db }) => async(req, res) => {
  const { user } = res.locals
  const newRun = req.body
  const runToInsert = {
    friendly_name: newRun.friendly_name,
    duration: newRun.duration,
    distance: newRun.distance,
    created: newRun.created,
    user_id: user.id
  }

  await db.insert(runToInsert).into('runs')
  res.send(runToInsert)
}

const update = ({ db }) => async(req, res) => {
  const { user } = res.locals
  const updatedRun = req.body
  let { id } = req.params

  const run = await db('runs').select().where('id', id)
  if ((run.length === 0) || (user.role === 'user' && run[0].user_id !== user.id)) {
    res.status(401)
    return res.send({ error: true })
  }

  const runToUpdate = {
    friendly_name: updatedRun.friendly_name,
    distance: updatedRun.distance,
    duration: updatedRun.duration,
    created: updatedRun.created
  }

  await db('runs')
    .where('id', id)
    .update(runToUpdate)

  res.send(runToUpdate)
}
const getByUserId = ({ db }) => async(req, res) => {
  const { user } = res.locals
  if (user.role === 'admin' && req.query.admin) {
    let id = req.params.id
    const runs = await 
      db.select(['runs.id', 'runs.user_id', 'runs.friendly_name', 
                 'runs.duration', 'runs.created', 'runs.distance', 
                 'users.email', 'users.name', 'users.passwd', 
                 'users.role', 'users.timezone', 'users.unit'])
        .from('runs')
        .leftJoin('users', 'users.id', 'runs.user_id')
        .where('users.id', id)
    res.send({
      data: runs,
      pagination: {
        message: 'soon :)'
      }
    })
  } else {
    const runs = await 
    db.select(['runs.id', 'runs.user_id', 'runs.friendly_name', 
               'runs.duration', 'runs.created', 'runs.distance', 
               'users.email', 'users.name', 'users.passwd', 
               'users.role', 'users.timezone', 'users.unit'])
      .from('runs').leftJoin('users', 'users.id', 'runs.user_id')
      .where('user_id', user.id)
    res.send({
      data: runs,
      pagination: {
        message: 'soon :)'
      }
    })
  }
}

module.exports = {
  get,
  getOne,
  remove,
  create,
  update,
  getByUserId
}