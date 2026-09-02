import { Router } from 'express'
import {
  listResources,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController.js'

const router = Router()

router.get('/', listResources)
router.post('/', createResource)
router.put('/:id', updateResource)
router.delete('/:id', deleteResource)

export default router
