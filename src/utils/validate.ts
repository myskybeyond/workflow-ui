/**
 * 判断url是否是http或https
 * @returns {Boolean}
 * @param url
 */
export const isHttp = (url: string): boolean => {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1;
};

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {Boolean}
 */
export const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path);
};

/**
 * @param {string} str
 * @returns {Boolean}
 */
export const validUsername = (str: string) => {
  const valid_map = ['admin', 'editor'];
  return valid_map.indexOf(str.trim()) >= 0;
};

/**
 * @param {string} url
 * @returns {Boolean}
 */
export const validURL = (url: string) => {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
};

/**
 * @param {string} str
 * @returns {Boolean}
 */
export const validLowerCase = (str: string) => {
  const reg = /^[a-z]+$/;
  return reg.test(str);
};

/**
 * @param {string} str
 * @returns {Boolean}
 */
export const validUpperCase = (str: string) => {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
};

/**
 * @param {string} str
 * @returns {Boolean}
 */
export const validAlphabets = (str: string) => {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
};

/**
 * @param {string} email
 * @returns {Boolean}
 */
export const validEmail = (email: string) => {
  const reg =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
};

/**
 * @param {string} str
 * @returns {Boolean}
 */
export const isString = (str: any) => {
  return typeof str === 'string' || str instanceof String;
};

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export const isArray = (arg: string | string[]) => {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
  return Array.isArray(arg);
};

const checkPasswordStrength = (password: string) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // 计算满足条件的字符类型的数量
  const typesCount = (hasUpperCase ? 1 : 0) + (hasLowerCase ? 1 : 0) + (hasDigits ? 1 : 0) + (hasSpecialChars ? 1 : 0);

  // 如果密码满足至少两种类型的字符，则返回true
  return typesCount >= 2;
};

export const validatePassword = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('密码不能为空'));
  }
  if (!checkPasswordStrength(value)) {
    return callback(new Error('密码至少需要包含大写字母、小写字母、数字、特殊字符中的两种或以上'));
  }
  callback();
};

export const passwordValidator = (value: string) => {
  if (!value) {
    return '密码不能为空';
  }
  if (!checkPasswordStrength(value)) {
    return '密码至少需要包含大写字母、小写字母、数字、特殊字符中的两种或以上';
  }
};
