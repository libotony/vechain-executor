import { stringToHex } from './utils'

export const Params = {
    address: stringToHex('Params', 20),
    methods: {
        get: { "constant": true, "inputs": [{ "name": "_key", "type": "bytes32" }], "name": "get", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
        set: { "constant": false, "inputs": [{ "name": "_key", "type": "bytes32" }, { "name": "_value", "type": "uint256" }], "name": "set", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
    },
    keys: {
        rewardRatio: stringToHex('reward-ratio', 32),
        proposerEndorsement: stringToHex('proposer-endorsement', 32),
        baseGasPrice: stringToHex('base-gas-price', 32),
        maxBlockPropers: stringToHex('max-block-proposers', 32)
    }
}
