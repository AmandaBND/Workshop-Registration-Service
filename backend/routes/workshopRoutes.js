const router = require('express').Router();
const { requireLogin, allow } = require('../middleware/auth');
const workshops = require('../controllers/workshopController');
const registrations = require('../controllers/registrationController');


router.use(requireLogin);
router.get('/', allow('manager', 'staff'), workshops.listWorkshops);
router.post('/', allow('manager'), workshops.createWorkshop);
router.put('/:id', allow('manager'), workshops.updateWorkshop);
router.get('/:id/registrations', allow('manager', 'staff'), registrations.listRegistrations);
router.post('/:id/registrations', allow('manager', 'staff'), registrations.register);
module.exports = router;
