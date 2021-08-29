import is from '@sindresorhus/is'
import ms from 'ms'
import tryParse from './try_parse'

const expiry = async (ttl: string | number | undefined): Promise<number> => {
  const oneDay = ms('1d') / 1000
  const twoDays = ms('2d') / 1000
  let expires: string | number

  if (is.string(ttl) && ttl.length) {
    if (tryParse(ttl)) {
      expires = parseInt(ttl)
    } else {
      expires = ms(ttl) / 1000
    }
  } else if (is.number(ttl)) {
    expires = ttl
  } else {
    expires = oneDay
  }

  if (expires > twoDays) {
    expires = twoDays
  }

  return expires
}

export default expiry
