const Review = require('./../model/reviewmodel');
const getAllReviews = async (req, res, next) => {
  let filterObj = {};
  try {
    if (req.params.tourId) {
      filterObj.tour = req.params.tourId;
    }
    const reviews = await Review.find(filterObj);
    res.status(200).json({
      status: 'sucess',
      data: {
        reviews
      }
    });
  } catch (err) {
    next(err);
  }
};
const getReview = async (req, res, next) => {
  review = await Review.findById(req.params.id);
  if (!review) {
    // console.log('no tour');
    const err = new appError('there is not review with this id', 404);
    return next(err);
  }
  res.status(200).json({
    status: 'sucess',
    data: {
      review
    }
  });
};
const createReview = async (req, res, next) => {
  try {
    if (!req.body.tour) {
      req.body.tour = req.params.tourId;
    }
    if (!req.body.user) {
      req.body.user = req.user.id;
    }
    const review = await Review.create(req.body);
    res.status(200).json({
      status: 'sucess',
      data: {
        review
      }
    });
  } catch (err) {
    next(err);
  }
};
const updateReview = async (req, res, next) => {
  try {
    const updatedTour = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    res.status(200).json({
      status: 'sucess',
      data: {
        tour: updatedTour
      }
    });
  } catch (err) {
    //
    return next(err);
  }
};
const deleteReview = async (req, res, next) => {
  // console.log('hello');
  try {
    const tour = await Review.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new appError('no records found with this id', 404));
    }
    res.status(204).json({
      status: 'sucess',
      data: null
    });
  } catch (err) {
    // res.status(404).json({ status: 'fail', message: err });
    return next(err);
  }
};
module.exports = {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview
};
