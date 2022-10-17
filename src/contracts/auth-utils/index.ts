import { abi, keccak256 } from 'thor-devkit'
import {Buffer} from 'buffer'
import * as bytecode from './bytecode.json'

// Set EVM version to 'byzantium' in complier for using in Pre-ETH_CONST blocks.
// Compiled data of 'auth-utils.sol'
// tslint:disable-next-line: max-line-length
const listAllABI = { 'inputs': [], 'name': 'all', 'outputs': [{ 'components': [{ 'internalType': 'address', 'name': 'master', 'type': 'address' }, { 'internalType': 'address', 'name': 'endorsor', 'type': 'address' }, { 'internalType': 'bytes32', 'name': 'identity', 'type': 'bytes32' }, { 'internalType': 'bool', 'name': 'endorsed', 'type': 'bool' }, { 'internalType': 'bool', 'name': 'active', 'type': 'bool' }], 'internalType': 'struct AuthorityUtils.Candidate[]', 'name': 'list', 'type': 'tuple[]' }], 'stateMutability': 'view', 'type': 'function' }
const listAll = new abi.Function(listAllABI as any as abi.Function.Definition)

// txID + clauseIndex + creationCount 0x841a6556c524d47030762eb14dc4af897e605d9b
const contractAddr = '0x' + keccak256(Buffer.alloc(40)).slice(12).toString('hex')
/* here we use `POST /account/*` to simulate executing a tx, clause#0 to deploy a `ghost contract`
   which will be dropped after the request, the txID in `POST /account/*` is zero by default then
   we can compute the contract deployed offline and call the methods in clause#1
*/

export interface MasterNode {
    master: string,
    endorsor: string,
    identity: string,
    active: boolean,
    endorsed: boolean,
}

export const ListAll = async (thor: Connex.Thor) => {
    const ret = await thor.explain([
            {
                to: null,
                value: '0',
                data: bytecode.listAll
            }, {
                to: contractAddr,
                value: '0',
                data: listAll.encode()
        }
    ]).execute()

    if (ret[0].reverted || ret[1].reverted) {
        throw new Error('execution reverted')
    }
    return listAll.decode(ret[1].data).list as MasterNode[]
}

