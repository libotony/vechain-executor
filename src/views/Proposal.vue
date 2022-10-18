<template>
    <b-container class="w-75 mx-auto">
        <b-container class="mt-4">
            <b-overlay :show="loading">
                <b-card no-body>
                    <template #header>
                        <div class="d-flex justify-content-between">
                            <h4 class="my-auto">Proposal</h4>
                            <span>
                                <b-button variant="primary" pill @click="loadData">
                                    <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                                </b-button>
                            </span>
                        </div>
                    </template>
                    <b-list-group flush>
                        <list-item v-show="loading && !proposal">
                            <template #content>
                                <span>LOADING</span>
                            </template>
                        </list-item>
                        <list-item v-if="!loading && !proposal">
                            <template #content>
                                <span>NOT FOUND</span>
                            </template>
                        </list-item>
                        <template v-if="proposal">
                            <list-item v-for="(value, key) in proposal" :key="key">
                                <template #content>
                                    <b-col cols="2"><strong>{{key}}:</strong></b-col>
                                    <b-col cols="10" class="text-monospace text-truncate">
                                        <span>{{value}}</span>
                                    </b-col>
                                </template>
                            </list-item>
                            <list-item v-if="approvers.length">
                                <template #content>
                                    <b-col cols="2"><strong>Proposers:</strong></b-col>
                                    <b-col cols="10" class="text-monospace text-truncate">
                                        <p v-for="appr in approvers">{{appr}}</p>
                                    </b-col>
                                </template>
                            </list-item>
                            <b-list-group-item class="py-1" v-if="input.params.length">
                                <b-row class="justify-content-center">
                                    <b-card class="w-100">
                                        <template #header>
                                            <strong>{{input.name}}</strong>
                                        </template>
                                        <b-card-body class="p-0">
                                            <b-table small :items="input.params" responsive
                                                tbody-tr-class="text-monospace text-smaller" class="mb-0">
                                            </b-table>
                                        </b-card-body>
                                    </b-card>
                                </b-row>
                            </b-list-group-item>
                            <list-item v-else class="py-1">
                                <template #content>
                                    <b-col cols="2"><strong>Content:</strong></b-col>
                                    <b-col cols="10" class="text-monospace text-truncate">
                                        <p>{{input.name}}</p>
                                    </b-col>
                                </template>
                            </list-item>
                        </template>
                    </b-list-group>
                </b-card>
            </b-overlay>
        </b-container>
    </b-container>
</template>
  
<script setup lang="ts">
import { abi } from 'thor-devkit';
import { inject, ref } from 'vue';
import { useRoute } from 'vue-router/composables'
import { Authority, Executor, Params, abbr } from '../contracts';

const connex = inject<Connex>('$connex')!
const route = useRoute()
const proposal = ref<{
    ID: string;
    Proposer: string;
    Proposed: string;
    Executor?: string;
    Executed?: string;
    Quorum?: string;
} | null>(null)
const approvers = ref<string[]>([])
const input = ref<{
    name: string;
    params: {
        name: string;
        type: string;
        value: string;
    }[]
}>({
    name: '',
    params: []
})
const loading = ref(true)

const contracts = {
    params: {
        set: new abi.Function(Params.methods.set as abi.Function.Definition)
    },
    authority: {
        add: new abi.Function(Authority.methods.add as abi.Function.Definition),
        revoke: new abi.Function(Authority.methods.revoke as abi.Function.Definition)
    }, executor: {
        addApprover: new abi.Function(Executor.methods.addApprover as abi.Function.Definition),
        revokeApprover: new abi.Function(Executor.methods.revokeApprover as abi.Function.Definition),
        attachVotingContract: new abi.Function(Executor.methods.attachVotingContract as abi.Function.Definition),
        detachVotingContract: new abi.Function(Executor.methods.detachVotingContract as abi.Function.Definition),
    }
}

const loadData = async () => {
    const proposalID = route.params.id

    if (/^0x[0-9a-fA-f]{40}/i.test(proposalID)) {
        const ret = await connex
            .thor
            .account(Executor.address)
            .method(Executor.methods.proposals)
            .call(proposalID)

        if (parseInt(ret.decoded['timeProposed'])) {
            const evs = await connex
                .thor
                .account(Executor.address)
                .event(Executor.events.Proposal)
                .filter([{ proposalID }])
                .cache([Executor.address])
                .apply(0, 100)

            let executed = 0
            let executor = ''
            approvers.value = []
            for (const ev of evs) {
                if (ev.decoded['action'] === Executor.actions.approved) {
                    approvers.value.push(ev.meta.txOrigin)
                } else if ((ev.decoded['action'] === Executor.actions.executed)) {
                    executed = ev.meta.blockTimestamp
                    executor = ev.meta.txOrigin
                }
            }

            const target = ret.decoded['target']
            const data = ret.decoded['data']
            let method = ''
            let coder: abi.Function | null = null
            switch (target.toLowerCase()) {
                case Params.address:
                    method += 'Params'
                    if (data.slice(0, 10) === contracts.params.set.signature) {
                        coder = contracts.params.set
                    } else {
                        method += `.${data.slice(0, 10)}`
                    }
                    break
                case Authority.address:
                    method += 'Authority'
                    if (data.slice(0, 10) === contracts.authority.add.signature) {
                        coder = contracts.authority.add
                    } else if (data.slice(0, 10) === contracts.authority.revoke.signature) {
                        coder = contracts.authority.revoke
                    } else {
                        method += `.${data.slice(0, 10)}`
                    }
                    break
                case Executor.address:
                    method += 'Executor'
                    if (data.slice(0, 10) === contracts.executor.addApprover.signature) {
                        coder = contracts.executor.addApprover
                    } else if (data.slice(0, 10) === contracts.executor.revokeApprover.signature) {
                        coder = contracts.executor.revokeApprover
                    } else if (data.slice(0, 10) === contracts.executor.attachVotingContract.signature) {
                        coder = contracts.executor.attachVotingContract
                    } else if (data.slice(0, 10) === contracts.executor.attachVotingContract.signature) {
                        coder = contracts.executor.attachVotingContract
                    } else {
                        method += `.${data.slice(0, 10)}`
                    }
                    break
                default:
                    method += `${abbr(target)}.${data.slice(0, 10)}`
            }

            if (coder) {
                input.value.name = method + `.${coder.canonicalName}`
                const decoded = abi.decodeParameters(coder.definition.inputs, '0x' + data.slice(10))
                input.value.params = coder.definition.inputs.map((p, i) => {
                    return {
                        name: p.name,
                        type: p.type,
                        value: decoded[i]
                    }
                })
            } else {
                input.value.name = method
            }

            proposal.value = {
                ID: proposalID,
                Proposer: ret.decoded['proposer'],
                Proposed: new Date(parseInt(ret.decoded['timeProposed']) * 1000).toLocaleString()
            }
            if (executor) proposal.value.Executor = executor
            if (executed) proposal.value.Executed = new Date(executed * 1000).toLocaleString()
            proposal.value.Quorum = ret.decoded['quorum']
        } else {
            proposal.value = null
        }
    }
    loading.value = false
}

loadData().catch()
</script>
