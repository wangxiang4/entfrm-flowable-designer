/**
 * @program: entfrm-flowable-designer
 *
 * @description: 随机字符串生成器
 * 浏览器的Math.random不能最大程度保证唯一性
 * 参考randomstring源码决定使用node自带的crypto
 * 但是字符串用满是还是会出现重复的问题,不过也比Math.random的可用次数多一些了
 * 满足目前需求了,再说目前也不会出现字符串用满的情况
 *
 * Math.random:缺点
 * 只能生成有 0-9、a-z字符组成的字符串
 * 由于 Math.random()生成的18位小数，可能无法填充36位，最后几个字符串，只能在指定的几个字符中选择。导致随机性降低。
 * 某些情况下会返回空值。例如，当随机数为 0, 0.5, 0.25, 0.125...时，返回为空值。
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-10-18
 **/

export default function (length = 32) {
  const numbers = '0123456789'
  const charsLower = 'abcdefghijklmnopqrstuvwxyz'
  const charsUpper = charsLower.toUpperCase()
  // 定义匹配字符(包含所有可读字符,符号不算)
  const matchChars = numbers + charsLower + charsUpper
  const matchCharsLen = matchChars.length
  // 计算可生成的最大字节数值256-8(256取余62=8)=248
  const maxByte = 256 - (256 % matchCharsLen)
  let randomString = ''
  // 设置重试,避免出现crypto生成字节数组超出maxByte,发生生成的随机字符串长度不足
  while (randomString.length < length) {
    // 根据内部crypto生成字节数组规则计算,最大不能超过maxByte
    // 计算目前最好生成几个字节,来最大限度保证生成的字节数最大不会超过maxByte
    const buf = safeRandomBytes(Math.ceil(length * 256 / maxByte))
    randomString = processString(buf, randomString, matchChars, length, maxByte)
  }
  return randomString
}

/** 安全随机字节(确保一定可以获取到crypto生成的随机字节数组) **/
function safeRandomBytes (length) {
  const randomBytes = require('crypto').randomBytes
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return randomBytes(length)
    } catch (e) {
      continue
    }
  }
}

/** 进程字符串(根据随机字节匹配定义的匹配字符进行生成随机字符串) **/
function processString (buf, randomString, matchChars, length, maxByte) {
  let string = randomString
  for (let i = 0; i < buf.length && string.length < length; i++) {
    const randomByte = buf.readUInt8(i)
    if (randomByte < maxByte) {
      // 取余计算获取匹配字符长度,为了防止随机字节大于匹配字符长度而拿不到匹配字符
      string += matchChars.charAt(randomByte % matchChars.length)
    }
  }
  return string
}
