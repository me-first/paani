/*eslint-disable*/
import '@babel/polyfill';

import { login, signup, logout } from './login';
import { allUsers } from './allusers';
import { waterDelivered } from './status';
import { updateData } from './updateData';
import { updatePassword } from './updatePassword';
import { sendQuery } from './sendQuery';

const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const logoutBtn = document.querySelector('.navbar__button--logout');
const allUserBtn = document.querySelector('#alluser-btn');
const filterBy = document.querySelector('#filter');
const prevBtn = document.querySelector('.paginate__prev');
const nextBtn = document.querySelector('.paginate__next');
const calenderAdmin = document.querySelector('#calender__admin');
const calenderUser = document.querySelector('#calender__user');
const updateProfileForm = document.querySelector('#updateData');
const updatePasswordForm = document.querySelector('#updatePassword');
const contactForm = document.querySelector('.contact__form');
const allSections = document.querySelectorAll('section');

const reveal = (entries, observer) => {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('scroll-down');

  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(reveal, {
  root: null,
  threshold: 0.2,
});

allSections.forEach((section) => {
  sectionObserver.observe(section);
  section.classList.add('scroll-down');
});

let type;
let next = 1;

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const mobile = document.querySelector('#mobile').value;
    const address = document.querySelector('#address').value;
    const connectionFor = document.querySelector('#connectionFor').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;

    const data = {
      name,
      email,
      mobile,
      address,
      connectionFor,
      password,
      passwordConfirm,
    };
    signup(data);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const mobile = document.querySelector('#mobile').value;
    const password = document.querySelector('#password').value;

    type = mobile === '7987109019' ? 'admin' : 'users';

    login(type, mobile, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (allUserBtn) {
  allUserBtn.addEventListener('click', allUsers(next));
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    next++;

    const userBox = document.querySelectorAll('.users__box');
    userBox.forEach((box) => box.remove());
    allUsers(next);
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    next--;
    if (next <= 1) prevBtn.disabled = true;

    const userBox = document.querySelectorAll('.users__box');
    userBox.forEach((box) => box.remove());
    allUsers(next);
  });
}

if (calenderAdmin) {
  const user = JSON.parse(calenderAdmin.dataset.user);
  const date = new Date();
  const days = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

  for (let i = 1; i <= days; i++) {
    const markup = `
    <div class="calender__box">
    <div class="calender__date">${i}</div>
    <div class="calender__date-status"></div>
    <div class="calender__date-icons">
    <img src="../img/icons/check.png" alt="success" class="success" />
    <img src="../img/icons/remove.png" alt="fail" class="fail" />
    </div>
    </div>
    `;

    calenderAdmin.insertAdjacentHTML('beforeend', markup);
  }

  const calenderBoxes = document.querySelectorAll('.calender__box');
  const calenderDatesStatus = document.querySelectorAll(
    '.calender__date-status'
  );
  const rightTicks = document.querySelectorAll('.success');
  const crossTicks = document.querySelectorAll('.fail');

  user.deliveries.forEach((delivery) => {
    if (delivery.status) {
      calenderBoxes[+delivery.deliveredAt - 1].classList.add('active');
      calenderDatesStatus[+delivery.deliveredAt - 1].textContent = 'success';
      rightTicks[+delivery.deliveredAt - 1].classList.add('success-active');
    }
    if (!delivery.status) {
      calenderBoxes[+delivery.deliveredAt - 1].classList.add('inactive');
      calenderDatesStatus[+delivery.deliveredAt - 1].textContent = 'fail';
      crossTicks[+delivery.deliveredAt - 1].classList.add('fail-active');
    }
  });

  calenderBoxes.forEach((box) => {
    box.addEventListener('click', (e) => {
      e.preventDefault();
      const rightBtn = box.querySelector('.success');
      const wrongBtn = box.querySelector('.fail');
      const calenderDate = +box.querySelector('.calender__date').textContent;
      if (e.target !== rightBtn && e.target !== wrongBtn) return;

      if (e.target === rightBtn) {
        waterDelivered('success', user, calenderDate);
        e.target.classList.add(`${e.target.alt}-active`);
        box.querySelector('.calender__date-status').textContent = e.target.alt;
        box.classList.add('active');
      }
      if (e.target === wrongBtn) {
        waterDelivered('fail', user, calenderDate);
        e.target.classList.add(`${e.target.alt}-active`);
        box.querySelector('.calender__date-status').textContent = e.target.alt;
        box.classList.add('inactive');
      }
    });
  });
}

if (calenderUser) {
  const [user] = JSON.parse(calenderUser.dataset.user);
  const date = new Date();
  const days = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

  for (let i = 1; i <= days; i++) {
    const markup = `
    <div class="calender__box">
    <div class="calender__date">${i}</div>
    <div class="calender__date-status"></div>
    <div class="calender__date-icons">
    &nbsp;
    &nbsp;
    </div>
    </div>
    `;

    calenderUser.insertAdjacentHTML('beforeend', markup);
  }

  const calenderBoxes = document.querySelectorAll('.calender__box');
  const calenderDatesStatus = document.querySelectorAll(
    '.calender__date-status'
  );

  user.deliveries.forEach((delivery) => {
    if (delivery.status) {
      calenderBoxes[+delivery.deliveredAt - 1].classList.add('active');
      calenderDatesStatus[+delivery.deliveredAt - 1].textContent = 'success';
    }
    if (!delivery.status) {
      calenderBoxes[+delivery.deliveredAt - 1].classList.add('inactive');
      calenderDatesStatus[+delivery.deliveredAt - 1].textContent = 'fail';
    }
  });
}

if (updateProfileForm) {
  updateProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('mobile', document.querySelector('#mobile').value);
    form.append('photo', document.querySelector('#photo').files[0]);

    type = mobile === '7987109019' ? 'admin' : 'users';
    updateData(type, form);
  });
}
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.querySelector('#passwordcurrent').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordconfirm').value;

    updatePassword(type, passwordCurrent, password, passwordConfirm);
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document
      .querySelector('.contact__form--name-input')
      .value.toLowerCase();
    const email = document.querySelector('.contact__form--email-input').value;
    const message = document.querySelector(
      '.contact__form--message-input'
    ).value;
    sendQuery(name, email, message);

    location.reload(true);
  });
}
