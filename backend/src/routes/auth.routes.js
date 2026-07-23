const express = require('express');
const {
  register,
  login,
  me,
  updateMe,
  changePassword,
  deleteMe,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);
router.patch('/password', requireAuth, changePassword);
router.delete('/me', requireAuth, deleteMe);

module.exports = router;
