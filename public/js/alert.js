/*eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.remove();
};

export const showAlert = (type, msg) => {
  hideAlert();
  const alertEl = `
  <div class="alert alert--${type}">
    <h3 class="alert__heading">${msg}</h3>
  </div>
    `;

  document.querySelector('body').insertAdjacentHTML('beforebegin', alertEl);

  setTimeout(hideAlert, 3000);
};
