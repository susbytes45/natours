const express = require('express');
const fs = require('fs');

// const { Module } = require('module');

const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteMe,
  updateMe,
  getMe,
  updateUserPhoto,
  resizeUserPhoto
} = require('./../controllers/usercontrollers');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrict,
  logout
} = require('./../controllers/authcontroller');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:resetToken', resetPassword);
router.use(protect);
router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateUserPhoto, resizeUserPhoto, updateMe);
router.patch('/deleteMe', protect, deleteMe);
router.get('/me', protect, getMe, getUser);
router.use(restrict('admin'));
router
  .route('/')
  .get(protect, getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(protect, deleteMe);
module.exports = router;
