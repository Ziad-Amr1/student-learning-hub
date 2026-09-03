import * as Profile from '../models/Profile.js'

export function getProfile(req, res) {
  const profile = Profile.get()
  res.status(200).json({ success: true, data: profile })
}

export function upsertProfile(req, res) {
  const profile = Profile.upsert(req.body)
  res.status(200).json({ success: true, data: profile })
}
