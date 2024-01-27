const fs = require('fs');
const Tour = require('./../model/tourmodel');
const multer = require('multer');
const appError = require('../appError');
const sharp = require('sharp');
const multerstorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('not an image please upload', 400), false);
  }
};
const upload = multer({
  storage: multerstorage,
  fileFilter: multerFilter
});
exports.uplaodTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);
exports.resizeTourImages = async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // 1)cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);
  req.body.imageCover = imageCoverFilename;
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
};
class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const exculdeFields = ['page', 'limit', 'sort', 'fields'];
    exculdeFields.forEach(el => delete queryObj[el]);
    // console.log(req.query, queryObj);

    // advanced filtering
    let qryStr = JSON.stringify(queryObj);

    qryStr = qryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(JSON.parse(qryStr));

    this.query = this.query.find(JSON.parse(qryStr));
    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  selecting() {
    if (this.queryString.fields) {
      const queryfields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(queryfields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
    // if (req.query.page) {
    //   const docvalue = await Tour.countDocuments();
    //   if (skip >= docvalue) {
    //     throw new Error('this page does not exsist');
    //   }
    // }
  }
}

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );
// exports.checkId = (req, res, next, val) => {
//   console.log(val);
//   const id = req.params.id * 1;
//   if (id > tours.length) {
//     return res.status(404).json({
//       status: 'error',
//       message: 'invalid id'
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   console.log(req.body);
//   console.log(Object.hasOwn(req.body, 'price'));
//   if (!Object.hasOwn(req.body, 'name') || !Object.hasOwn(req.body, 'price')) {
//     return res.status(404).json({
//       status: 'errror',
//       message: 'tour must contain name and price'
//     });
//   }
//   next();
// };
exports.getTourStats = async (req, res) => {
  try {
    const tourStats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gt: 4.5 } } },

      // $group: {
      //   // _id: $difficulty,
      //   // noofdocuments: { $sum: 1 }
      //   // averageratings: { $avg: '$ratingsAverage' }
      // }
      {
        $group: {
          _id: '$difficulty',
          totaldocs: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' }
        }
      },
      { $sort: { avgRating: 1 } }
    ]);
    res.status(200).json({
      status: 'sucess',
      data: {
        stat: tourStats
      }
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: 'agg not working' });
  }
};
exports.getAllTours = async (req, res, next) => {
  try {
    const features = new APIfeatures(Tour.find(), req.query);
    const query = features
      .filter()
      .sorting()
      .selecting()
      .pagination().query;
    // const queryObj = { ...req.query };
    // const exculdeFields = ['page', 'limit', 'sort', 'fields'];
    // exculdeFields.forEach(el => delete queryObj[el]);
    // console.log(req.query, queryObj);

    // // advanced filtering
    // let qryStr = JSON.stringify(queryObj);

    // qryStr = qryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(qryStr));

    // let query = Tour.find(JSON.parse(qryStr));
    // // 3 sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   console.log(sortBy);

    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // // fields
    // if (req.query.fields) {
    //   const queryfields = req.query.fields.split(',').join(' ');
    //   query = query.select(queryfields);
    // } else {
    //   query = query.select('-__v');
    // }
    // // const tours = await Tour.find()
    // //   .where('difficulty')
    // //   .equals('easy');
    // //pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const docvalue = await Tour.countDocuments();
    //   if (skip >= docvalue) {
    //     throw new Error('this page does not exsist');
    //   }
    // }

    const tours = await query;
    res.status(200).json({
      status: 'sucess',
      result: tours.length,
      requestedAt: req.reqquestTime,
      data: {
        tours
      }
    });
  } catch (err) {
    next(err);
  }
  // res.json({
  //   name: 'suhsil',
  // });
};
exports.createTour = async (req, res, next) => {
  // console.log(req.body);
  // const newid = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newid }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(200).json({ status: 'sucess', data: { tour: newTour } });
  //   }
  // );
  // res.send('done');
  try {
    const newtour = await Tour.create(req.body);
    res.status(200).json({
      status: 'sucess',
      data: {
        tour: newtour
      }
    });
  } catch (err) {
    // return res.status(404).json({ status: 'fail', message: err });
    next(err);
  }
};
exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
      console.log('no tour');
      const err = new appError('there is not tour with this id', 404);
      return next(err);
    }
    res.status(200).json({
      status: 'sucess',
      data: {
        tour
      }
    });
  } catch (err) {
    //
    return next(err);
  }
  // console.log(req.params);
  // const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);
  // console.log(tour);
  // res.json({
  //   status: 'sucess',
  //   tour: tour
  // result: tours.length,
  // data: {
  //   tours: tours,
  // },
  // });
};
exports.updateTour = async (req, res, next) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
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
exports.deleteTour = async (req, res, next) => {
  // console.log('hello');
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

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
exports.checkbdy = (req, res, next) => {
  if (typeof req.body.name === 'number') {
    // console.log(typeof req.body.name);
    // return res.status(404).json({
    //   sttaus: 'fail',
    //   message: 'a name must be of type string'
    // });
    const message = 'a tour name must be string';
    const err = new appError(message, 404);
    return next(err);
  }
  next();
};
