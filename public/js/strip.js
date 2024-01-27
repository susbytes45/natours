import axios from 'axios';
import { showAlert } from './alert';
const Stripe = require('stripe');
export const bookTour = async tourId => {
  // get checkout session from api
  const stripe = Stripe(
    'pk_test_51OcPFjSCSdt3ZLF2OUp2UB2aGyjPwsY3qahZXVZQRa0cL8VzFk9b90JvlFeidORiwQCAURamcoLJbIWbJpsk7Tcu00QQMpT2Gg'
  );
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(`${session} from stripe`);
    // craete checkout form  + chanre credit card
    // await stripe.redirectTOCheckout({
    // //   sessionId: session.data.session.id

    // });
    window.location.replace(session.data.session.url);
  } catch (err) {
    showAlert('error', err);
    next(err);
  }
};
