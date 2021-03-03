import { Router } from 'express'
import { todo } from '../model/index.js'

const router = Router()

const list = async (req, res) => {
  const { offset, limit, complete, search, field } = req.query
  let result = todo
    .find()
    .sort({ date: -1 })
    .skip((parseInt(offset) - 1) * parseInt(limit))
    .limit(parseInt(limit))
  let count = await todo.countDocuments()
  if (complete != undefined) {
    count = await todo.countDocuments().where('complete').equals(complete)
    result.where('complete').equals(complete)
    if (search != undefined && field != undefined) {
      count = await todo
        .countDocuments()
        .where('complete')
        .equals(complete)
        .where(field)
        .regex(search)
      result.where(field).regex(search)
    }
  }
  if (search != undefined && complete == undefined && field != undefined) {
    count = await todo.countDocuments().where(field).regex(search)
    result.where(field).regex(search)
  }
  try {
    const page = Math.ceil(count / parseInt(limit))
    await result.exec((err, result) => {
      if (err) res.status(400).send(err)
      if (result == []) res.status(404)
      res.json({ pagination: { count, page }, query: result })
    })
  } catch (error) {
    res.json(error)
  }
}

router.get('/', list)

router.get('/:id', async (req, res) => {
  // if (req.query) return schedule.scheduleJob("* * * * * 30",() => {
  //   console.log('hello world!')
  // })
  await todo.findOne({ _id: req.params.id }).exec((err, result) => {
    if (err) return res.status(404).send(err)
    res.send(result)
  })
})

router.post('/', async (req, res) => {
  await todo.create(req.body, (err) => {
    if (err) return console.log(err)
  })
  res.status(201).json('create todo list')
})

router.put('/:id', async (req, res) => {
  await todo.findOneAndUpdate({ _id: req.params.id }, req.body).exec(() => {
    res.status(200).json({ message: 'success to update data' })
  })
})

router.delete('/:id', async (req, res) => {
  await todo.findOneAndRemove({ _id: req.params.id }).exec(() => {
    res.status(200).json({ message: 'success to delete data' })
  })
})

export default router
