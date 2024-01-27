const express = require('express');

const { protect, restrict } = require('./../controllers/authcontroller');
const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getOne,
  updateBooking,
  deleteBokings
} = require('./../controllers/bookingcontroller');
const router = express.Router();
router.use(protect);
router.get('/checkout-session/:tourId', getCheckoutSession);
router.use(restrict('admin', 'lead-guide'));
router
  .route('/')
  .get(getAllBookings)
  .post(createBooking);

router
  .route('/:id')
  .get(getOne)
  .patch(updateBooking)
  .delete(deleteBokings);

module.exports = router;
