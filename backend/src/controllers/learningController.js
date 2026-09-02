import * as Learning from '../models/Learning.js'
import { ApiError } from '../utils/ApiError.js'

export function listLearning(req, res) {
  const entries = Learning.findAll()
  res.status(200).json({ success: true, count: entries.length, data: entries })
}

export function createLearning(req, res) {
  const entry = Learning.create(req.body)
  res.status(201).json({ success: true, data: entry })
}

export function updateLearning(req, res, next) {
  const updated = Learning.update(req.params.id, req.body)
  if (!updated) {
    return next(new ApiError(404, `Learning entry with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, data: updated })
}

export function deleteLearning(req, res, next) {
  const deleted = Learning.remove(req.params.id)
  if (!deleted) {
    return next(new ApiError(404, `Learning entry with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, message: 'Learning entry deleted successfully.' })
}
