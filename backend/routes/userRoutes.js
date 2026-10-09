const router = require('express').Router();
const { requireLogin, allow } = require('../middleware/auth');
const users = require('../controllers/userController');


router.use(requireLogin, allow('admin'));
router.get('/', users.listUsers);
router.post('/', users.createUser);
module.exports = router;
