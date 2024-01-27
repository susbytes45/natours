const mongoose = require('mongoose');
const Tour = require('./tourmodel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review must contain text']
    },
    rating: { type: Number, min: 1, max: 5 },
    craetedAt: { type: Date, default: Date.now() },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true }
  // }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'user',
  //   select: 'name photo'
  // }).populate({
  //   path: 'tour',
  //   select: 'name'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcRatingAverage = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        noofrating: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].noofrating,
      ratingsAverage: stats[0].averageRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcRatingAverage(this.tour);
});
// find byidanddelete and findbyidandupdate
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this);
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcRatingAverage(this.r.tour);
});
// review
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
