import * as Resource from '../models/Resource.js'
import { ApiError } from '../utils/ApiError.js'

export function listResources(req, res) {
  const resources = Resource.findAll()
  res.status(200).json({ success: true, count: resources.length, data: resources })
}

export function createResource(req, res) {
  const resource = Resource.create(req.body)
  res.status(201).json({ success: true, data: resource })
}

export function updateResource(req, res, next) {
  const updated = Resource.update(req.params.id, req.body)
  if (!updated) {
    return next(new ApiError(404, `Resource with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, data: updated })
}

export function deleteResource(req, res, next) {
  const deleted = Resource.remove(req.params.id)
  if (!deleted) {
    return next(new ApiError(404, `Resource with id '${req.params.id}' was not found.`))
  }
  res.status(200).json({ success: true, message: 'Resource deleted successfully.' })
}
