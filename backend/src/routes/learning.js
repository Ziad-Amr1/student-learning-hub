import { Router } from 'express'
import {
  listLearning,
  createLearning,
  updateLearning,
  deleteLearning,
} from '../controllers/learningController.js'

const router = Router()

router.get('/', listLearning)
router.post('/', createLearning)
router.put('/:id', updateLearning)
router.delete('/:id', deleteLearning)

export default router
