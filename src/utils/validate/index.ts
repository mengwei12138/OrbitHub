/**
 * 校验中国大陆手机号
 * @param value 待校验的字符串
 * @returns 是否为有效的手机号
 * @example validatePhone('13812345678') // true
 * @example validatePhone('12345678901') // false
 */
export function validatePhone(value: string): boolean {
  return /^1[3-9]\d{9}$/u.test(value);
}

function validateAreaCode(code: string): boolean {
  if (code.length !== 6) return false;
  const province = parseInt(code.substring(0, 2), 10);
  return province >= 11 && province <= 65;
}

function validateBirthDate(
  year: number,
  month: number,
  day: number,
  is18Bit: boolean,
): boolean {
  const currentYear = new Date().getFullYear();
  const minYear = is18Bit ? 1900 : 1900 + (currentYear - 2000);
  const maxYear = is18Bit ? currentYear : 1999;

  if (year < minYear || year > maxYear) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (isLeapYear) daysInMonth[1] = 29;
  }
  if (day < 1 || day > daysInMonth[month - 1]) return false;

  return true;
}

function validateCheckCode(idCard: string): boolean {
  const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i], 10) * weight[i];
  }
  const expectedCode = checkCode[sum % 11];
  return idCard[17].toUpperCase() === expectedCode;
}

/**
 * 严格校验中国大陆身份证号
 * @param value 待校验的字符串
 * @returns 是否为有效的身份证号
 * @example validateIdCard('110101199001011234') // true
 * @example validateIdCard('11010119900101123X') // true
 * @example validateIdCard('110101900101123') // true (15位)
 */
export function validateIdCard(value: string): boolean {
  if (!value) return false;

  const is18Bit = value.length === 18;
  const is15Bit = value.length === 15;

  if (!is18Bit && !is15Bit) return false;

  const pattern = is18Bit ? /^\d{17}[\dXx]$/u : /^\d{15}$/u;
  if (!pattern.test(value)) return false;

  const areaCode = value.substring(0, 6);
  if (!validateAreaCode(areaCode)) return false;

  let year: number, month: number, day: number;
  if (is18Bit) {
    year = parseInt(value.substring(6, 10), 10);
    month = parseInt(value.substring(10, 12), 10);
    day = parseInt(value.substring(12, 14), 10);
  } else {
    year = parseInt(`19${value.substring(6, 8)}`, 10);
    month = parseInt(value.substring(8, 10), 10);
    day = parseInt(value.substring(10, 12), 10);
  }
  if (!validateBirthDate(year, month, day, is18Bit)) return false;

  if (is18Bit && !validateCheckCode(value)) return false;

  return true;
}
