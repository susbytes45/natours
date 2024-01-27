const User = require('./../model/usermodel');
const jwt = require('jsonwebtoken');
const appError = require('./../appError');
const util = require('util');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Email = require('./../email');
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      photo: req.body.photo,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role
    });
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url, newUser.name);
    await new Email(newUser, url).sendWelcome();
    newUser.password = undefined;
    res.cookie('jwt', token, {
      expiresIn: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true
    });
    res.status(200).json({
      status: 'sucess',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // if the email and password exsist
    if (!email || !password) {
      const err = new appError(
        'please enter the email and password correctly',
        404
      );
      return next(err);
    }
    // check if usere exsist and password is correct
    const newuser = await User.findOne({ email: email }).select('+password');
    console.log(newuser);
    if (!newuser) {
      return next(
        new appError(
          'no user with this email is avaliable please enter the correct email'
        )
      );
    }
    console.log(password, newuser.name);
    const match = await bcrypt.compare(password, newuser.password);
    if (!match) {
      console.log('not correct password');
      return next(
        new appError(
          'the password is invalid please enter the correct password',
          404
        )
      );
    }

    // if everything ok the sent token
    const token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.cookie('jwt', token, {
      expiresIn: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true
    });
    res.status(200).json({
      data: { status: 'success', token }
    });
  } catch (err) {
    return next(err);
  }
};

exports.protect = async (req, res, next) => {
  // if json token is there or not
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    console.log('from protect');
    console.log(token);
    // check the jwt and retrive the payload
    if (!token) {
      next(new appError('you are not logged in please login first', 401));
    }
    const jwtverifypromise = util.promisify(jwt.verify);
    const decoded = await jwtverifypromise(token, process.env.JWT_SECRET);

    // console.log(`${decoded} at protect`);
    if (!decoded) {
      return next(new appError('invalid token'));
    }

    // check the user is there or not
    const freshuser = await User.findById(decoded.id);
    if (!freshuser) {
      next(new appError('The user belonging to this token does not exsist'));
    }
    // check user has change the pas(sword or not
    if (freshuser.changePasswordAft(decoded.iat)) {
      return next(
        new appError('User recently changed password please login again ', 401)
      );
    }
    req.user = freshuser;
    res.locals.user = freshuser;
    // freshuser.fun();

    next();
  } catch (err) {
    next(new appError('user not login please login ', 401));
  }
};
exports.restrict = function(...userRoles) {
  return (req, res, next) => {
    if (!userRoles.includes(req.user.role)) {
      next(new appError('you are not allowed to access this ', 403));
    }
    next();
  };
};
exports.forgotPassword = async (req, res, next) => {
  // console.log('fun');

  // check user with that email exsist or not
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new appError('no user with this email exsist', 401));
  }
  // create password reset token;
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send it to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  // const message = `forgot your password ? submit a patch request with your new password and password confirm to :${resetUrl}.\n If you dont forgot then please ignore this email`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'your password reset token is valid for only 10 mins',
    //   message
    // });
    await new Email(user, resetUrl).sendresetPassword();
    res.status(200).json({
      status: 'sucess',
      message: 'token sent to email'
    });
  } catch (err) {
    (user.createPasswordResetToken = undefined),
      (user.passwordResetExpiry = undefined),
      await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new appError('there was an error sending the email', 500));
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    console.log(req.params.resetToken);
    // comapre the reset token with user by first encrypting it;
    const resetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpiry: { $gt: Date.now() }
    });

    // if the user is not there sent error otherwise update the password and confirm password
    if (!user) {
      return next(new appError('token is invalid or expired', 400));
    }
    (user.password = req.body.password),
      (user.passwordConfirm = req.body.passwordConfirm),
      (user.passwordResetToken = undefined),
      (user.passwordResetExpiry = undefined);
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.status(200).json({
      status: 'sucess',
      token
    });
    // json web token sending
    // next();
  } catch (err) {
    next(err);
  }
};
exports.updatePassword = async (req, res, next) => {
  // get user from collection
  try {
    const user = await User.findById(req.user.id).select('+password');
    // console.log(user);

    // check if the posted current password is correct
    const match = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!match) {
      return next(
        new appError(
          'the password is invalid please enter the correct password',
          404
        )
      );
    }
    // if so update the password
    (user.password = req.body.password),
      (user.passwordConfirm = req.body.passwordConfirm),
      await user.save();
    // log user in send jwt
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.status(200).json({
      status: 'sucess',
      token
    });
  } catch (err) {
    next(err);
  }
  // next();
};

exports.isLoggedIn = async (req, res, next) => {
  // if json token is there or not
  try {
    console.log('hello from loged in ');
    if (req.cookies.jwt) {
      const jwtverifypromise = util.promisify(jwt.verify);
      const decoded = await jwtverifypromise(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);
      // check the user is there or not
      const freshuser = await User.findById(decoded.id);
      console.log(freshuser);
      if (!freshuser) {
        const err = new appError(
          'please enter valid email id and password',
          401
        );
        console.log(err);
        return next();
      }
      // check user has change the pas(sword or not
      if (freshuser.changePasswordAft(decoded.iat)) {
        return next();
      }
      res.locals.user = freshuser;
      console.log('from middle');
      return next();
      // freshuser.fun();/
    }
    return next();
  } catch (err) {
    return next();
  }
};
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'sucess' });
};
