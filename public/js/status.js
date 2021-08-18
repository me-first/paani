import axios from 'axios';
import { showAlert } from './alert';

export const waterDelivered = async (type, user, date) => {
  try {
    if (type === 'success') {
      const result = await axios({
        method: 'POST',
        url: `/api/v1/admin/deliveryStatus`,
        data: {
          status: true,
          deliveredAt: date,
          user: user.id,
        },
      });

      // console.log(result);
    }
    if (type === 'fail') {
      const result = await axios({
        method: 'POST',
        url: `/api/v1/admin/deliveryStatus`,
        data: {
          status: false,
          deliveredAt: date,
          user: user.id,
        },
      });

      // console.log(result);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
