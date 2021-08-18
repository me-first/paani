import axios from 'axios';

export const allUsers = async (next) => {
  const nextPage = String(next);
  const filterIt = 'connectionFor';
  let deleverIcon;
  try {
    const date = new Date();
    const result = await axios({
      method: 'GET',
      url: `/api/v1/admin?page=${nextPage}&limit=10&sort=${filterIt}`,
    });

    const allusers = result.data.data.users;

    allusers.forEach((user) => {
      const todayStatus = user.deliveries.filter(
        (el) => el.deliveredAt === +date.getDate()
      );
      deleverIcon =
        todayStatus[0]?.status === true ? 'delevered' : 'not-delevered';

      const markup = `
        <div class="users__box">
        <img src="../img/users/${user.photo}" alt="" class="users__img" />
        <a href='/${user.slug}' class="users__name">${user.name}</a>
        <div class="users__litre">${user.connectionFor}L</div>
        <div class="users__status">
          <div class="users__status-text">${deleverIcon}</div>
          <div class="users__status-icon ${deleverIcon}"></div>
        </div>
      </div>
        `;
      const filterEl = document.querySelector('.users__filter');

      if (filterEl) filterEl.insertAdjacentHTML('afterend', markup);
    });
  } catch (error) {
    console.log(error);
  }
};
