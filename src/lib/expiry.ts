import is from '@sindresorhus/is'
import ms from 'ms'

const expiry = (ttl: string | number | undefined): number => {
  const oneDay = ms('1d') / 1000
  const twoDays = ms('2d') / 1000
  let expires: string | number = oneDay

  if (is.string(ttl)) {
    expires = /\w/.test(ttl) ? ms(ttl) / 1000 : parseInt(ttl)
  }

  if (is.number(ttl)) {
    expires = ttl
  }

  if (expires > twoDays) {
    expires = twoDays
  }

  return expires
}

export default expiry
