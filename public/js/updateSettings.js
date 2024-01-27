import axios from 'axios';
const { showAlert } = require('./alert');
export const updateData = async data => {
  try {
    console.log(data);
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data: data
    });
    if (res.status === 200) {
      return showAlert('success', 'Data updated sucessfully');
    }
  } catch (err) {
    // console.error(err);
    showAlert('error', 'there was an error');
  }
};
export const updatePassword = async (
  password,
  currentPassword,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:7000/api/v1/users/updatePassword',
      data: { password, currentPassword, passwordConfirm }
    });
    if (res.status === 200) {
      showAlert('sucess', 'password  updated sucessfully');
    }
  } catch (err) {
    // console.error(err);
    showAlert('error', 'there was an error');
  }
};
