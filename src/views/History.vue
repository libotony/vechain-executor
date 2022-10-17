<template>
    <b-container class="w-75 mx-auto">
        <b-container class="mt-4">
            <b-card no-body>
                <template #header>
                    <div class="d-flex justify-content-between">
                        <h4 class="my-auto">History</h4>
                        <span>
                            <b-button variant="primary" @click="refresh" :disabled="loading">Refresh</b-button>
                        </span>
                    </div>
                </template>
                <b-list-group flush>
                    <list-item v-show="proposals.length===0 && !loading">
                        <template #content>
                            <span>NO CONTENT</span>
                        </template>
                    </list-item>
                    <b-list-group-item v-show="proposals.length!==0 && !loading">
                        <b-row class="my-1 font-weight-bold">
                            <b-col lg="3" class="d-flex align-items-center">
                                <span>
                                    Time
                                </span>
                            </b-col>
                            <b-col lg="7" class="d-flex align-items-center">
                                <span class="text-monospace text-truncate">
                                    Proposal
                                </span>
                            </b-col>
                            <b-col lg="2" class="d-flex align-items-center justify-content-end">
                                <span>
                                    Executed
                                </span>
                            </b-col>
                        </b-row>
                    </b-list-group-item>
                    <list-item v-for="proposal in proposals" :key="proposal.id">
                        <template #content>
                            <b-col lg="3" class="d-flex align-items-center">
                                <span class="text-smaller">
                                    {{new Date(proposal.time*1000).toLocaleString()}}
                                </span>
                            </b-col>
                            <b-col lg="8" class="d-flex align-items-center">
                                <span class="text-monospace text-truncate">
                                    {{proposal.desc}}
                                </span>
                            </b-col>
                            <b-col lg="1" class="d-flex align-items-center">
                                <b-icon-check-circle v-if="proposal.executed" variant="success"></b-icon-check-circle>
                                <b-icon-x-circle v-else variant="danger"></b-icon-x-circle>
                            </b-col>
                        </template>
                    </list-item>
                    <list-item>
                        <template #content>
                            <b-overlay :show="loading" rounded opacity="0.6" spinner-small spinner-variant="primary"
                                class="d-inline-block">
                                <b-button ref="button" :disabled="loading||!hasMore" variant="primary" @click="loadData">
                                    MORE
                                </b-button>
                            </b-overlay>
                        </template>
                    </list-item>
                </b-list-group>
            </b-card>
        </b-container>
    </b-container>
</template>
  
<script setup lang="ts">
import { abi } from 'thor-devkit'
import { inject, ref } from 'vue'
import { descMethod } from '../contracts'
import { Executor } from '../contracts/executor'

const connex = inject<Connex>('$connex')!
let head = connex.thor.status.head.number

const executor = {
    Proposal: connex.thor.account(Executor.address).event(Executor.events.Proposal).filter([]).cache([Executor.address]),
    proposals: new abi.Function(Executor.methods.proposals as abi.Function.Definition)
}

const proposals = ref<{
    id: string;
    time: number,
    desc: string,
    executed: boolean
}[]>([])
const loading = ref(false)
const hasMore = ref(true)

const refresh = async () => {
    head = connex.thor.status.head.number
    proposals.value = []
    hasMore.value = true
    pos = 0
    return loadData()
}

let pos = 0
const pageCount = 10
const loadData = async () => {
    loading.value = true
    let offset = pos
    const step = 100
    let stop = false

    if (head === 0) {
        if (connex.thor.status.head.number) {
            head = connex.thor.status.head.number
        } else {
            await connex.thor.ticker().next()
            head = connex.thor.status.head.number
        }
    }

    const proposed: string[] = []
    for (; ;) {
        const filtered = await executor.Proposal.order('desc').range({
            unit: 'block',
            from: 0,
            to: head
        }).apply(offset, step)

        if (!filtered.length) {
            break
        }

        for (const [index, ev] of filtered.entries()) {
            const id = ev.decoded['proposalID'] as string
            if (ev.decoded['action'] === Executor.actions.proposed) {
                proposed.push(id)
                if (proposed.length >= pageCount) {
                    pos = offset + index + 1
                    stop = true
                }
            }
        }
        if (stop) {
            break
        }
        offset += step
    }

    if (proposed.length) {
        const clauses: Connex.VM.Clause[] = []
        for (let i = 0; i < proposed.length; i++) {
            clauses.push({
                to: Executor.address,
                value: 0,
                data: executor.proposals.encode(proposed[i])
            })
        }
        const ret = await connex.thor.explain(clauses).cache([Executor.address]).execute()

        for (const [index, pps] of ret.entries()) {
            const decoded = executor.proposals.decode(pps.data)
            proposals.value.push({
                id: proposed[index],
                time: decoded['timeProposed'],
                desc: descMethod(decoded['target'], decoded['data']),
                executed: decoded['executed'] as boolean,
            })
        }
    }
    if (proposed.length < pageCount) {
        hasMore.value = false
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