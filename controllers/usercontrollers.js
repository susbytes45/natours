const appError = require('../appError');
const User = require('./../model/usermodel');
const multer = require('multer');
// const sharp = require('sharp');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('Not an image please uplaod only images', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const filterObj = (filterObject, ...allowedfields) => {
  let newObj = {};
  Object.keys(filterObject).forEach(el => {
    if (allowedfields.includes(el)) {
      newObj[el] = filterObject[el];
    }
  });
  return newObj;
};
exports.updateUserPhoto = upload.single('photo');
// exports.resizeUserPhoto = async (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }
//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
//   await sharp(file.buffer)
//     .resize(500, 500)
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`);
//   next();
// };
exports.createUser = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });
    res.status(200).json({
      status: 'sucess',
      data: {
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};
exports.updateMe = async (req, res, next) => {
  // user doesnt enter password in body their is another route for changing password
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError(
        'you cant change the password from this route please go to update password'
      ),
      403
    );
  }
  // filter out unwanted
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    filterBody.photo = req.file.filename;
  }
  // update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'sucess',
    data: {
      user: updatedUser
    }
  });

  // next();
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = async (req, res) => {
  const user = await User.find();
  res.status(200).json({
    status: 'sucess',
    user
  });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: 'sucess',
    user
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not yet defined'
  });
};
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: 'sucess',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
