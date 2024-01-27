const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { DEFAULT_CIPHERS } = require('tls');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name']
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'enter the correct email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'please enter the password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'user'],
    default: 'user'
  },

  passwordConfirm: {
    type: String,
    required: [true, 'a user must enter password confirm'],
    validate: {
      validator: function(val) {
        return this.password === val;
      },
      message: 'passworrd does not matches '
    }
  },
  changePasswordAt: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userSchema.pre(/^find/, function(next) {
  // this.find({ active: true });
  next();
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.changePasswordAt = Date.now();
  next();
});
userSchema.methods.changePasswordAft = function(JWTTimestamp) {
  console.log(this);
  if (this.changePasswordAt) {
    var timeStamp = parseInt(this.changePasswordAt.getTime() / 1000, 10);
    console.log(timeStamp, JWTTimestamp);
    // 100<200
    return JWTTimestamp < timeStamp;
  }

  return false;
};
userSchema.methods.createPasswordResetToken = function() {
  console.log('from instance');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
  console.log(this.passwordResetToken, resetToken, this.passwordResetExpiry);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
