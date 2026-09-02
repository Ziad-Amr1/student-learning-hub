import { Router } from 'express'
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js'

const router = Router()

router.get('/', listNotes)
router.post('/', createNote)
router.put('/:id', updateNote)
router.delete('/:id', deleteNote)

export default router
