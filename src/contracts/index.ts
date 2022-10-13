import { Executor } from './executor';
import { Params } from './params'
import { Authority } from './authority'
import { abi } from 'thor-devkit';
import { abbr } from './utils';

export * from './params'
export * as AuthUtils from './auth-utils'

export const ContractName = (addr: string) => {
    switch (addr.toLowerCase()) {
        case Params.address:
            return 'Params';
        case Executor.address:
            return 'Executor'
        case Authority.address:
            return 'Executor'
        default:
            return addr
    }
}

export const descMethod = (addr: string, data: string) => {
    const params = {
        set: new abi.Function(Params.methods.set as abi.Function.Definition)
    }
    const authority = {
        add: new abi.Function(Authority.methods.add as abi.Function.Definition),
        revoke: new abi.Function(Authority.methods.revoke as abi.Function.Definition)
    }
    const executor = {
        addApprover: new abi.Function(Executor.methods.addApprover as abi.Function.Definition),
        revokeApprover: new abi.Function(Executor.methods.revokeApprover as abi.Function.Definition),
        attachVotingContract: new abi.Function(Executor.methods.attachVotingContract as abi.Function.Definition),
        detachVotingContract: new abi.Function(Executor.methods.detachVotingContract as abi.Function.Definition),
    }

    let desc = ''
    switch (addr.toLowerCase()) {
        case Params.address:
            desc += 'Params'
            if (data.slice(0, 10) === params.set.signature) {
                const decoded = abi.decodeParameters(params.set.definition.inputs, '0x'+data.slice(10))
                desc += `.set(${Buffer.from(decoded['_key'].slice(2), 'hex').toString().replace(/\x00/g, "")})`
            } else {
                desc += `.${data.slice(0, 10)}`
            }
            break
        case Authority.address:
            desc += 'Authority'
            if (data.slice(0, 10) === authority.add.signature) {
                const decoded = abi.decodeParameters(authority.add.definition.inputs, '0x' + data.slice(10))
                desc += `.add(${abbr(decoded['_nodeMaster'])})`
            } else if (data.slice(0, 10) === authority.revoke.signature) { 
                const decoded = abi.decodeParameters(authority.revoke.definition.inputs, '0x' + data.slice(10))
                desc += `.revoke(${abbr(decoded['_nodeMaster'])})`
            } else {
                desc += `.${data.slice(0, 10)}`
            }
            break
        case Executor.address:
            desc += 'Executor'
            if (data.slice(0, 10) === executor.addApprover.signature) { 
                const decoded = abi.decodeParameters(executor.addApprover.definition.inputs, '0x' + data.slice(10))
                desc += `.addApprover(${abbr(decoded['_approver'])})`
            } else if (data.slice(0, 10) === executor.revokeApprover.signature) { 
                const decoded = abi.decodeParameters(executor.revokeApprover.definition.inputs, '0x' + data.slice(10))
                desc += `.revokeApprover(${abbr(decoded['_approver'])})`
            }  else if (data.slice(0, 10) === executor.attachVotingContract.signature) { 
                const decoded = abi.decodeParameters(executor.attachVotingContract.definition.inputs, '0x' + data.slice(10))
                desc += `.attachVotingContract(${abbr(decoded['_approver'])})`
            }   else if (data.slice(0, 10) === executor.attachVotingContract.signature) { 
                const decoded = abi.decodeParameters(executor.detachVotingContract.definition.inputs, '0x' + data.slice(10))
                desc += `.detachVotingContract(${abbr(decoded['_approver'])})`
            }else {
                desc += `.${data.slice(0, 10)}`
            }
            break
        default:
            desc += `${abbr(addr)}.${data.slice(0, 10)}`
    }

    return desc
}