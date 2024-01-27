const express = require('express');
const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview
} = require('./../controllers/reviewcontroller');
const { protect, restrict } = require('./../controllers/authcontroller');
const router = express.Router({ mergeParams: true });
router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrict('user'), createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrict('user', 'admin'), updateReview)
  .delete(restrict('user', 'admin'), deleteReview);
module.exports = router;
