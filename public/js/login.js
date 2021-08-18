import axios from 'axios';

import { showAlert } from './alert';

export const signup = async (data) => {
  try {
    const result = await axios({
      method: 'POST',
      url: `http://127.0.0.1:7000/api/v1/users/signup`,
      data: {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        connectionFor: data.connectionFor,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
    });
    console.log(result);

    if (result.data.status === 'success') {
      showAlert('success', 'Welcome, your account is created!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    console.log(error.response);
    showAlert('error', error.response.data.message);
  }
};

export const login = async (type, mobile, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: `http://127.0.0.1:7000/api/v1/${type}/login`,
      data: {
        mobile,
        password,
      },
    });
    console.log(result);

    if (result.data.status === 'success') {
      showAlert('success', 'You are successfully logged In!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    console.log(error.response.data);
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: `http://127.0.0.1:7000/api/v1/users/logout`,
    });

    if (result.data.status === 'success') {
      showAlert('success', 'logged out successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', 'Problem in logging out');
  }
};
