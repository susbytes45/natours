const Tour = require('./../model/tourmodel');
const appError = require('./../appError');
const Book = require('./../model/bookingmodel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.getCheckoutSession = async (req, res, next) => {
  try {
    // 1)get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    // 2)craete the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user._id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `{tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
            }
          }
        }
      ]
    });
    // 3)create session as response
    res.status(200).json({
      status: 'sucess',
      session
    });
  } catch (err) {
    next(err);
  }
};
exports.createBookingCheckout = async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }
  console.log(tour, user, price);
  await Book.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
};
exports.createBooking = (req, res, next) => {
  Book.createOne();
};
exports.getOne = async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  res.status(200).json({
    status: 'sucess',
    bookings: book
  });
};
exports.getAllBookings = async (req, res, next) => {
  const bookings = await Book.find();
  res.status(200).json({
    status: 'sucess',
    bookings: bookings
  });
};
exports.updateBooking = (req, res, next) => {
  Book.updateOne();
};
exports.deleteBokings = (req, res, next) => {
  Book.deleteOne();
};
