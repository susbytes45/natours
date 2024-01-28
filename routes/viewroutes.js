const express = require('express');
const {
  getOverview,
  getTour,
  loginview,
  getAccount,
  updateUserData,
  getMyTour,
  signupview
} = require('./../controllers/viewcontroller');
const { isLoggedIn, protect } = require('./../controllers/authcontroller');
const { createBookingCheckout } = require('./../controllers/bookingcontroller');
// console.log(getOverview);
const router = express.Router();
// console.log(isLoggedIn);
// router.use(isLoggedIn);
router.get('/', createBookingCheckout, isLoggedIn, getOverview);
// router.use();
router.get('/login', isLoggedIn, loginview);
router.get('/signup', isLoggedIn, signupview);
// router.get('/logout',)
// router.get('/tour', getTour);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, isLoggedIn, getMyTour);
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
