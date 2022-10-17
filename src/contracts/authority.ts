import { stringToHex } from './utils'

export const Authority = {
    address: stringToHex('Authority', 20),
    methods: {
        add: { "constant": false, "inputs": [{ "name": "_nodeMaster", "type": "address" }, { "name": "_endorsor", "type": "address" }, { "name": "_identity", "type": "bytes32" }], "name": "add", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
        revoke: {"constant":false,"inputs":[{"name":"_nodeMaster","type":"address"}],"name":"revoke","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"} 
    }
}