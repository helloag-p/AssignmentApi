const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const { listUsers, updateUserRole } = require('../controllers/userController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Admin - list all users
 *     tags: [Users]
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
router.get('/', listUsers);

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     summary: Admin - update a user's role
 *     tags: [Users]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/role',
  [body('role').notEmpty().withMessage('role is required')],
  updateUserRole
);

module.exports = router;

