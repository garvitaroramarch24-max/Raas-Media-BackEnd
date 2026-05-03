const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/auth');

// Public routes (specific paths before /:id so "category" is not captured as an id)
router.get('/', projectController.getAllProjects);
router.get('/category/:category', projectController.getProjectsByCategory);
router.get('/:id', projectController.getProjectById);

// Protected routes (Admin only)
router.post('/', authenticateToken, projectController.createProject);
router.put('/:id', authenticateToken, projectController.updateProject);
router.delete('/:id', authenticateToken, projectController.deleteProject);

module.exports = router;
