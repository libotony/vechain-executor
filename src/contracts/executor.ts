import { stringToHex } from './utils';
import {Buffer} from 'buffer'

export const Executor = {
    address: stringToHex('Executor', 20),
    methods: {
        approvers: {"constant":true,"inputs":[{"name":"","type":"address"}],"name":"approvers","outputs":[{"name":"identity","type":"bytes32"},{"name":"inPower","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}
    },
    events: {
        Approvers: {"anonymous":false,"inputs":[{"indexed":true,"name":"approver","type":"address"},{"indexed":false,"name":"action","type":"bytes32"}],"name":"Approver","type":"event"}
    },
    actions: {
        revoked: '0x' + Buffer.from('revoked').toString('hex').padEnd(64, '0'),
        added: '0x' + Buffer.from('added').toString('hex').padEnd(64, '0')
    }
}