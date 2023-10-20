import { stringToHex } from './utils'
import { Buffer } from 'buffer'
import { abi } from 'thor-devkit'

export const Executor = {
    address: stringToHex('Executor', 20),
    methods: {
        approvers: { 'constant': true, 'inputs': [{ 'name': '', 'type': 'address' }], 'name': 'approvers', 'outputs': [{ 'name': 'identity', 'type': 'bytes32' }, { 'name': 'inPower', 'type': 'bool' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' },
        proposals: { 'constant': true, 'inputs': [{ 'name': '', 'type': 'bytes32' }], 'name': 'proposals', 'outputs': [{ 'name': 'timeProposed', 'type': 'uint64' }, { 'name': 'proposer', 'type': 'address' }, { 'name': 'quorum', 'type': 'uint8' }, { 'name': 'approvalCount', 'type': 'uint8' }, { 'name': 'executed', 'type': 'bool' }, { 'name': 'target', 'type': 'address' }, { 'name': 'data', 'type': 'bytes' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' },
        addApprover: { 'constant': false, 'inputs': [{ 'name': '_approver', 'type': 'address' }, { 'name': '_identity', 'type': 'bytes32' }], 'name': 'addApprover', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' },
        revokeApprover: { 'constant': false, 'inputs': [{ 'name': '_approver', 'type': 'address' }], 'name': 'revokeApprover', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' },
        attachVotingContract: { 'constant': false, 'inputs': [{ 'name': '_contract', 'type': 'address' }], 'name': 'attachVotingContract', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' },
        detachVotingContract: { 'constant': false, 'inputs': [{ 'name': '_contract', 'type': 'address' }], 'name': 'detachVotingContract', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' },
        propose: { 'constant': false, 'inputs': [{ 'name': '_target', 'type': 'address' }, { 'name': '_data', 'type': 'bytes' }], 'name': 'propose', 'outputs': [{ 'name': '', 'type': 'bytes32' }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' },
        approve: { 'constant': false, 'inputs': [{ 'name': '_proposalID', 'type': 'bytes32' }], 'name': 'approve', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' },
        execute: { 'constant': false, 'inputs': [{ 'name': '_proposalID', 'type': 'bytes32' }], 'name': 'execute', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }
    },
    events: {
        Approvers: { 'anonymous': false, 'inputs': [{ 'indexed': true, 'name': 'approver', 'type': 'address' }, { 'indexed': false, 'name': 'action', 'type': 'bytes32' }], 'name': 'Approver', 'type': 'event' },
        Proposal: { 'anonymous': false, 'inputs': [{ 'indexed': true, 'name': 'proposalID', 'type': 'bytes32' }, { 'indexed': false, 'name': 'action', 'type': 'bytes32' }], 'name': 'Proposal', 'type': 'event' }
    },
    actions: {
        revoked: '0x' + Buffer.from('revoked').toString('hex').padEnd(64, '0'),
        added: '0x' + Buffer.from('added').toString('hex').padEnd(64, '0'),
        proposed: '0x' + Buffer.from('proposed').toString('hex').padEnd(64, '0'),
        executed: '0x' + Buffer.from('executed').toString('hex').padEnd(64, '0'),
        approved: '0x' + Buffer.from('approved').toString('hex').padEnd(64, '0')
    }
}

export const getApprovers = async (thor: Connex.Thor) => {
    const coderApprovers = new abi.Function(Executor.methods.approvers as abi.Function.Definition)
    const approvers: {
        address: string;
        identity: string;
    }[] = []

    let offset = 0
    const step = 40
    const revoked = new Set<string>()
    const addrs: string[] = []
    for (; ;) {
        const filtered = await thor
            .account(Executor.address)
            .event(Executor.events.Approvers)
            .filter([])
            .cache([Executor.address])
            .apply(offset, step)
    
        if (!filtered.length) {
            break
        }
        for (const ev of filtered) {
            if (ev.decoded['action'] === Executor.actions.revoked) {
                revoked.add(ev.decoded['approver'])
            }
            addrs.push(ev.decoded['approver'])
        }

        offset += step
    }
    const inPower = addrs.filter(x => !revoked.has(x))
    const clauses: Connex.VM.Clause[] = []
    for (const address of inPower) {
        clauses.push({
            to: Executor.address,
            value: 0,
            data: coderApprovers.encode(address)
        })
    }
    const ret = await thor.explain(clauses).cache([Executor.address]).execute()
    for (const [index, address] of inPower.entries()) {
        const decoded = coderApprovers.decode(ret[index].data)
        approvers.push({
            address,
            identity: decoded['identity']
        })
    }
    return approvers
}