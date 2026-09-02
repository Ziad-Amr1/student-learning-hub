import { Router } from 'express'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js'
import { validate } from '../middleware/validate.js'
import { TASK_RULES } from '../models/Task.js'

const router = Router()

router.get('/', listTasks)
router.post('/', validate(TASK_RULES), createTask)
router.put('/:id', validate(TASK_RULES), updateTask)
router.delete('/:id', deleteTask)

export default router
