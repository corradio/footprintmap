import Cookies from '../pkg/js-cookie.js';

const saveKey = (key, val) => {
  if (window.isCordova) {
    window.localStorage.setItem(key, val);
  } else {
    Cookies.set(key, val, {
      expires: 365
    });
  }
};

const getKey = key => {
  if (window.isCordova) {
    return window.localStorage.getItem(key);
  }

  return Cookies.get(key);
};

export { saveKey, getKey };