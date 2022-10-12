import { stringToHex } from './utils';
import { Buffer } from 'buffer'

export const Executor = {
    address: stringToHex('Executor', 20),
    methods: {
        approvers: { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "approvers", "outputs": [{ "name": "identity", "type": "bytes32" }, { "name": "inPower", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" },
        proposals: { "constant": true, "inputs": [{ "name": "", "type": "bytes32" }], "name": "proposals", "outputs": [{ "name": "timeProposed", "type": "uint64" }, { "name": "proposer", "type": "address" }, { "name": "quorum", "type": "uint8" }, { "name": "approvalCount", "type": "uint8" }, { "name": "executed", "type": "bool" }, { "name": "target", "type": "address" }, { "name": "data", "type": "bytes" }], "payable": false, "stateMutability": "view", "type": "function" },
        addApprover: { "constant": false, "inputs": [{ "name": "_approver", "type": "address" }, { "name": "_identity", "type": "bytes32" }], "name": "addApprover", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
        revokeApprover: { "constant": false, "inputs": [{ "name": "_approver", "type": "address" }], "name": "revokeApprover", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
        attachVotingContract: { "constant": false, "inputs": [{ "name": "_contract", "type": "address" }], "name": "attachVotingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
        detachVotingContract: {"constant":false,"inputs":[{"name":"_contract","type":"address"}],"name":"detachVotingContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}
    },
    events: {
        Approvers: { "anonymous": false, "inputs": [{ "indexed": true, "name": "approver", "type": "address" }, { "indexed": false, "name": "action", "type": "bytes32" }], "name": "Approver", "type": "event" },
        Proposal: { "anonymous": false, "inputs": [{ "indexed": true, "name": "proposalID", "type": "bytes32" }, { "indexed": false, "name": "action", "type": "bytes32" }], "name": "Proposal", "type": "event" }
    },
    actions: {
        revoked: '0x' + Buffer.from('revoked').toString('hex').padEnd(64, '0'),
        added: '0x' + Buffer.from('added').toString('hex').padEnd(64, '0'),
        proposed: '0x' + Buffer.from('proposed').toString('hex').padEnd(64, '0'),
        executed: '0x' + Buffer.from('executed').toString('hex').padEnd(64, '0')
    }
}