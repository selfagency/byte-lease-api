import is from '@sindresorhus/is'

const tryParse = (value: any) => {
  try {
    const parsed = parseInt(value)
    return is.number(parsed) && parsed.toString() !== 'NaN' ? true : false
  } catch (error) {
    return false
  }
}

export default tryParse
