

export const explorer = {
    account: (addr: string) => {
        return `https://insight.vecha.in/#/main/accounts/${addr}`
    },
    transaction: (txid: string) => {
        return `https://insight.vecha.in/#/main/txs/${txid}`
    }
}
export const nodeURL = 'https://mainnet.vecha.in'
// export const nodeURL = 'https://sync-mainnet.veblocks.net'