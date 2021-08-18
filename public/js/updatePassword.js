import axios from 'axios';
import { showAlert } from './alert';

export const updatePassword = async (
  type,
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const result = await axios({
      method: 'POST',
      url: `/api/v1/${type}/updatePassword`,
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });

    // console.log(result);

    if (result.data.status === 'success') {
      showAlert('success', 'Password updated Successfully');
      setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
    console.log(error.response);
  }
};
