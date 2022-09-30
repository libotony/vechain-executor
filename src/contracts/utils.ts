import {Buffer} from 'buffer'

export const stringToHex = (input: string, bytes = 20) => {
    return '0x' + Buffer.from(input).toString('hex').padStart(bytes*2, '0')
}