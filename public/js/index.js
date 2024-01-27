/*eslint-disable*/

console.log('hello from parser');
const formel = document.querySelector('.form--login');
import { login, logout } from './login';
import { updateData, updatePassword } from './updateSettings';
import { bookTour } from './strip';
// values
// const email = document.querySelector('#email').value;
// const password = document.querySelector('#password').value;
const userDataForm = document.querySelector('.form-user-data');
const bookbutton = document.getElementById('book-tour');
const changeUserPassword = document.querySelector('.form-user-settings');

console.log(userDataForm);
const logoutBtn = document.querySelector('.nav__el--logout');
if (formel) {
  formel.addEventListener('submit', el => {
    el.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
    // console.log('hellp');
  });
}
// console.log(logoutBtn);
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    console.log('from form data');
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.querySelector('#photo').files[0]);
    // const photo = document.querySelector('#photo').files[0];
    // const email = document.querySelector('#email').value;
    // const name = document.querySelector('#name').value;
    console.log(`${form} from user data form`);
    updateData(form);
  });
}
if (changeUserPassword) {
  changeUserPassword.addEventListener('submit', e => {
    e.preventDefault();
    console.log('password form');
    const currentPassword = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    updatePassword(password, currentPassword, passwordConfirm);
  });
}
if (bookbutton) {
  bookbutton.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    console.log(e.target.dataset);

    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
