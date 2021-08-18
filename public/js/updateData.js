import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (type, data) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: `/api/v1/${type}/updateMe`,
      data,
    });

    // console.log(result);

    if (result.data.status === 'success') {
      showAlert('success', 'Data updated Successfully');
      setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
    console.log(error.response);
  }
};
