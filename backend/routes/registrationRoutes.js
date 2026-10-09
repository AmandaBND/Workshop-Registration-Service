const router = require('express').Router();
const { requireLogin, allow } = require('../middleware/auth');
const { cancel } = require('../controllers/registrationController');


router.patch('/:id/cancel', requireLogin, allow('manager', 'staff'), cancel);
module.exports = router;
