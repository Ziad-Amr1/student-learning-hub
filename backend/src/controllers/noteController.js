import * as Note from '../models/Note.js'
import { ApiError } from '../utils/ApiError.js'

export function listNotes(req, res) {
  const notes = Note.findAll()
  res.status(200).json({ success: true, count: notes.length, data: notes })
}

export function createNote(req, res) {
  const note = Note.create(req.body)
  res.status(201).json({ success: true, data: note })
}

export function updateNote(req, res, next) {
  const updated = Note.update(req.params.id, req.body)
  if (!updated) {
    return next(new ApiError(404, `Note with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, data: updated })
}

export function deleteNote(req, res, next) {
  const deleted = Note.remove(req.params.id)
  if (!deleted) {
    return next(new ApiError(404, `Note with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, message: 'Note deleted successfully.' })
}
