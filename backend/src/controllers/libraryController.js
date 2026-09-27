import * as Library from '../models/Library.js'
import { ApiError } from '../utils/ApiError.js'

export function listLibrary(req, res) {
  const entries = Library.findAll()
  res.status(200).json({ success: true, count: entries.length, data: entries })
}

export function createLibrary(req, res) {
  const entry = Library.create(req.body)
  res.status(201).json({ success: true, data: entry })
}

export function updateLibrary(req, res, next) {
  const updated = Library.update(req.params.id, req.body)
  if (!updated) {
    return next(new ApiError(404, `Book with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, data: updated })
}

export function deleteLibrary(req, res, next) {
  const deleted = Library.remove(req.params.id)
  if (!deleted) {
    return next(new ApiError(404, `Book with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, message: 'Book deleted successfully.' })
}