const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  getTasks,
  getAllTasksAdmin,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List current user's tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Authentication required
 */
router.get('/', getTasks);

/**
 * @openapi
 * /tasks/all:
 *   get:
 *     summary: Admin - list all tasks for all users
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden
 */
router.get('/all', authorize('admin'), getAllTasksAdmin);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task for current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  createTask
);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by id (owned by current user)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTaskById);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task owned by current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Task not found
 */
router.put(
  '/:id',
  [body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')],
  updateTask
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden (non-owner trying to delete another user's task)
 *       404:
 *         description: Task not found
 */
router.delete('/:id', deleteTask);

module.exports = router;

