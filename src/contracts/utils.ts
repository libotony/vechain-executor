import { Buffer } from 'buffer'

/** covert sting to hex, padded from start */
export const stringToHex = (input: string, bytes = 20) => {
    return '0x' + Buffer.from(input).toString('hex').padStart(bytes * 2, '0')
}

export const abbr = (input: string) => {
    if (input.length === 66) {
        return `${input.slice(0, 10)}…${input.slice(58)}`
    } else if (input.length === 42) {
        return `${input.slice(0, 8)}…${input.slice(38)}`
    }
    return input
}