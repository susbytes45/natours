import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';
// const hiddenalert = () => {
//   const el = document.querySelector('.alert');
//   if (el) {
//     el.parentElement.removeChild(el);
//   }
// };
// const showAlert = (type, msg) => {
//   const markup = `<div class="alert alert--${type}">${message} </div>`;
//   document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
//   window.setTimeout(hiddenalert, 5000);
// };

// console.log('hello');
export const login = async (email, password) => {
  try {
    // console.log('from login');
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    // console.log(res.data, res);
    // console.log('hello  from login.js');
    if (res.status === 200) {
      showAlert('success', ' login sucessfully');
      // alert('logged in sucessfull');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    // console.log(res);
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};
export async function logout() {
  try {
    console.log('from logout');
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if (res.data.status == 'sucess') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! try again');
  }
}
