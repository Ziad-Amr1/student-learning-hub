import * as Task from '../models/Task.js'
import { ApiError } from '../utils/ApiError.js'

export function listTasks(req, res) {
  const tasks = Task.findAll()
  res.status(200).json({ success: true, count: tasks.length, data: tasks })
}

export function createTask(req, res) {
  const task = Task.create(req.body)
  res.status(201).json({ success: true, data: task })
}

export function updateTask(req, res, next) {
  const updated = Task.update(req.params.id, req.body)
  if (!updated) {
    return next(new ApiError(404, `Task with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, data: updated })
}

export function deleteTask(req, res, next) {
  const deleted = Task.remove(req.params.id)
  if (!deleted) {
    return next(new ApiError(404, `Task with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, message: 'Task deleted successfully.' })
}
