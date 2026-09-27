import { Router } from 'express'
import {
  listLibrary,
  createLibrary,
  updateLibrary,
  deleteLibrary,
} from '../controllers/libraryController.js'

const router = Router()

router.get('/', listLibrary)
router.post('/', createLibrary)
router.put('/:id', updateLibrary)
router.delete('/:id', deleteLibrary)

export default router