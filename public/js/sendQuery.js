import axios from 'axios';
import { showAlert } from './alert';

export const sendQuery = async (name, email, message) => {
  try {
    const result = await axios({
      method: 'POST',
      url: `/api/v1/users/createQuery`,
      data: {
        name,
        email,
        message,
      },
    });

    // console.log(result);
    if (result.data.status === 'success') {
      showAlert('success', 'Your Query is successfully sent!');
    }
  } catch (error) {
    console.log(error.response);
    showAlert('error', error.response.data.message);
  }
};
