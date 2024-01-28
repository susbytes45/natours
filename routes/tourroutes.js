const express = require('express');
const fs = require('fs');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
  checkbdy,
  getTourStats,
  uplaodTourImages,
  resizeTourImages
} = require('./../controllers/tourcontrollers');
const { protect, restrict } = require('./../controllers/authcontroller');
// const { createReview } = require('./../controllers/reviewcontroller');
const reviewRouter = require('./../routes/reviewroutes');
// const { Module } = require('module');
const router = express.Router();
// param get triggered as soon as we hit the /:id in route it will run first
// router.param('id', checkId);
// router.param('roll', (req, res, next, val) => {
//   console.log(val);
//   next();
// });

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrict('admin', 'lead-guide'), createTour);
router.route('/tourstats').get(getTourStats);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrict('admin', 'lead-guide'),
    checkbdy,
    uplaodTourImages,

    updateTour
  )
  .delete(protect, restrict('admin'), deleteTour);
// router.route('/:tourId/reviews').post(protect, restrict('user'), createReview);

// const data = 45;
module.exports = router;
