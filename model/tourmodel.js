const moongose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./usermodel');
// scehma bana
const tourSchema = new moongose.Schema(
  {
    name: {
      type: String,
      unique: true,
      // validate: [validator.isAlpha, 'name should contain only alphabets'],
      required: [true, 'a tour must have a name'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have  agroup size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'a average must be above 1'],
      max: [5, 'a average must be delow 5'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },

    price: Number,
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a required image cover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return this.price > val;
        },
        message: 'price Discount must be less than price'
      }
    },
    guides: [{ type: moongose.Schema.ObjectId, ref: 'User' }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
  select: 'review rating user'
});

// tourSchema.pre(/^find/, function(next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
tourSchema.pre(/^find/, function(next) {
  this.populate({ path: 'guides', select: '-__v -changePasswordAt' });
  next();
});
tourSchema.index({ price: 1, ratingsAverage: -1 });
// tourSchema.pre('save', async function(next) {
//   guidePromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });
//   model bana
const Tour = moongose.model('Tour', tourSchema);
//   model ka onject bana
// const testTour = new Tour({
// //   name: 'forsthiker'
// });
//   object ko save kiya
// testTour
//   .save()
//   .then(doc => console.log(doc))
//   .catch(err => console.log(err));
module.exports = Tour;
