<template>
    <b-container class="w-75 mx-auto">
        <b-container class="mt-4 mb-4">
            <b-card>
                <template #header>
                    <h4>Add Master Node</h4>
                </template>
                <b-container>
                    <b-form @submit="addMaster">
                        <b-form-group label-cols="2" label="Master:" label-for="input-1">
                            <b-form-input id="input-1" placeholder="Address of Master" required v-model="master" lazy
                                :state="isValidMaser">
                            </b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="2" label="Endorsor:" label-for="input-2">
                            <b-form-input id="input-2" placeholder="Address of Endorsor" required v-model="endorsor"
                                lazy :state="isValidEndorsor">
                            </b-form-input>
                        </b-form-group>
                        <b-form-group label-cols="2" label="Identity:" label-for="input-3">
                            <b-form-input id="input-3" placeholder="Plain text of identity, will be hashed" required
                                v-model="identity" lazy :state="isValidIdentity">
                            </b-form-input>
                        </b-form-group>
                        <p class="mt-3 text-monospace">Encoded: <span class="text-smaller">{{hashed}}</span> </p>
                        <b-button type="submit" variant="primary">Submit</b-button>
                    </b-form>
                </b-container>
            </b-card>
        </b-container>
        <b-container class="mt-4 mb-4">
            <b-overlay :show="loading">
                <b-card no-body>
                    <template #header>
                        <div class="d-flex justify-content-between">
                            <h4 class="my-auto">Pending Proposals</h4>
                            <span>
                                <b-button variant="primary" pill @click="loadData">
                                    <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                                </b-button>
                            </span>
                        </div>
                    </template>
                    <b-list-group flush>
                        <list-item v-show="pendingProposals.length==0">
                            <template #content>
                                <div style="min-height: 50px" class="d-flex align-items-center">
                                    <span v-show="loading">LOADING</span>
                                    <span v-show="!loading">NO CONTENT</span>
                                </div>
                            </template>
                        </list-item>
                        <list-item v-for="proposal in pendingProposals" :key="proposal.id">
                            <template #content>
                                <b-col
                                    class="text-monospace text-truncate d-flex align-items-center justify-content-between">
                                    <div>
                                        <b-form-checkbox v-model="proposal.selected" inline>
                                            <b-link :to="{name: 'proposal', params: {id: proposal.id}}">{{proposal.desc}}</b-link>
                                        </b-form-checkbox>
                                    </div>
                                    <span class="text-info">
                                        {{proposal.votes}}
                                    </span>
                                </b-col>
                                <b-col lg="3" class="d-flex align-items-center">
                                    <span class="font-weight-light text-secondary text-smaller">
                                        {{new Date(proposal.time*1000).toLocaleString()}}
                                    </span>
                                </b-col>
                            </template>
                        </list-item>
                        <b-list-group-item v-show="pendingProposals.length">
                            <b-row class="my-1 d-flex justify-content-end">
                                <span class="pr-2">
                                    <b-button variant="info" @click="selectAll">SELECT ALL</b-button>
                                </span>
                                <span class="pr-2">
                                    <b-button variant="info":disabled="!enableApprove"  @click="dismiss">DISMISS</b-button>
                                </span>
                                <span class="pr-2">
                                    <b-button variant="primary" :disabled="!enableApprove" @click="runExecutor(false)">Approve</b-button>
                                </span>
                                <span class="pr-2">
                                    <b-button variant="primary" :disabled="disableExecute" @click="runExecutor(true)">
                                        Execute</b-button>
                                </span>
                            </b-row>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </b-overlay>
        </b-container>
        <tx-modal v-model="showModal" :txid="txReq.txid" :error="txReq.error"></tx-modal>
    </b-container>
</template>

<script setup lang="ts">
import { abi, blake2b256 } from 'thor-devkit'
import { computed, inject, ref } from 'vue'
import { Executor, descMethod, Authority } from '../contracts'

const thor = inject<Connex.Thor>('$thor')!
const vendor = inject<Connex.Vendor>('$vendor')!

const showModal = ref(false)
const txReq = ref<{ error: string, txid: string }>({ error: '', txid: '' })

let session = {}
const sendTx = async (signReq: Connex.Vendor.TxSigningService) => {
    const theSession = session = {}

    txReq.value.error = ''
    txReq.value.txid = ''
    if (!showModal.value) {
        showModal.value = true
    }
    try {
        const resp = await signReq.request()
        if (theSession === session) {
            txReq.value.txid = resp.txid
        }
    } catch (e) {
        if (theSession === session) {
            txReq.value.error = (e as Error).message
        }
    }
}

const master = ref("")
const endorsor = ref("")
const identity = ref("")

const hashed = computed(() => {
    if (identity.value.length) {
        return '0x' + blake2b256(identity.value).toString('hex')
    } else {
        return ''
    }
})

const isValidIdentity = computed(() => {
    return !!identity.value
})

const isValidMaser = computed(() => {
    return /^0x[0-9a-fA-f]{40}/i.test(master.value)
})

const isValidEndorsor = computed(() => {
    return /^0x[0-9a-fA-f]{40}/i.test(endorsor.value)
})

const addMaster = async () => {
    const action = thor.account(Authority.address).method(Authority.methods.add).asClause(master.value, endorsor.value, hashed.value)
    await sendTx(
        vendor.sign('tx', [
            thor.account(Executor.address).method(Executor.methods.propose).asClause(action.to, action.data)
        ])
    )
}

const pendingProposals = ref<{ id: string; time: number; desc: string; selected: boolean, executable: boolean; votes: string }[]>([])
const loading = ref(true)

const executor = {
    Proposal: thor.account(Executor.address).event(Executor.events.Proposal).filter([]),
    proposals: new abi.Function(Executor.methods.proposals as abi.Function.Definition)
}

const selectAll = () => {
    for (const p of pendingProposals.value) {
        p.selected = true
    }
}

const dismiss = () => {
    for (const p of pendingProposals.value) {
        p.selected = false
    }
}

const runExecutor = async (execute: boolean) => {
    const ids = []
    for (const p of pendingProposals.value) {
        if (p.selected) {
            if (execute) {
                if (p.executable) {
                    ids.push(p.id)
                }
            } else {
                ids.push(p.id)
            }
        }
    }

    if (ids.length) {
        const method = thor.account(Executor.address).method(execute ? Executor.methods.execute : Executor.methods.approve)
        const msg: Connex.Vendor.TxMessage = []

        for (const id of ids) {
            msg.push({
                ...method.asClause(id),
                abi: execute ? Executor.methods.execute : Executor.methods.approve
            })
        }

        await sendTx(
            vendor.sign('tx', msg)
        )
    }
}

const enableApprove = computed(() => {
    for (const p of pendingProposals.value) {
        if (p.selected) {
            return true
        }
    }
    return false
})

const disableExecute = computed(() => {
    let hasSelected = false
    for (const p of pendingProposals.value) {
        hasSelected = hasSelected || p.selected
        if (p.selected && !p.executable) {
            return true
        }
    }
    if (!hasSelected) {
        return true
    }
    return false
})

const loadData = async () => {
    loading.value = true
    const ts = Math.floor((new Date().getTime()) / 1000)
    const now = ts - ts % 10

    let proposed: string[] = []
    const executed: string[] = []

    let offset = 0
    const step = 40
    for (; ;) {
        const filtered = await executor
            .Proposal
            .cache([Executor.address])
            .order('desc')
            .range({
                unit: 'time',
                from: now - 7 * 24 * 60 * 60, // a week ago
                to: now + 100,
            })
            .apply(offset, step)

        if (!filtered.length) {
            break
        }

        for (const ev of filtered) {
            const id = ev.decoded['proposalID'] as string
            if (ev.decoded['action'] === Executor.actions.proposed && !executed.includes(id)) {
                proposed.push(id)
            } else if (ev.decoded['action'] === Executor.actions.executed) {
                executed.push(id)
            }
        }
        offset += step
    }


    proposed = proposed.reverse()
    pendingProposals.value = []
    for (let i = 0; i < proposed.length; i += 10) {
        const clauses: Connex.VM.Clause[] = []
        for (let j = i; j < i + 10 && j < proposed.length; j++) {
            clauses.push({
                to: Executor.address,
                value: 0,
                data: executor.proposals.encode(proposed[j])
            })
        }
        const ret = await thor.explain(clauses).cache([Executor.address]).execute()

        for (const [index, pps] of ret.entries()) {
            const decoded = executor.proposals.decode(pps.data)
            if (decoded['executed']) {
                continue
            }
            pendingProposals.value.push({
                id: proposed[index + i],
                time: parseInt(decoded['timeProposed']),
                desc: descMethod(decoded['target'], decoded['data']),
                executable: (decoded['approvalCount'] as number) >= (decoded['quorum'] as number),
                votes: `${decoded['approvalCount']}/${decoded['quorum']}`,
                selected: false,
            })
        }
    }
    loading.value = false
}

loadData().catch()
</script>
<style>
.text-smaller {
    font-size: 0.7rem;
}
</style>