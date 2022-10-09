<template>
    <b-container class="w-75 mx-auto">
        <b-overlay :show="false">
            <b-container class="mt-4">
                <b-overlay :show="loading">
                    <b-card no-body>
                        <template #header>
                            <div class="d-flex justify-content-between">
                                <h4 class="my-auto">Overview</h4>
                                <b-button variant="primary" @click="loadData">Refresh</b-button>
                            </div>
                        </template>
                        <b-list-group flush>
                            <list-item v-for="(value, key) in paramsData" :key="key">
                                <template #content>
                                    <b-col lg="4"><strong>{{key}}:</strong></b-col>
                                    <b-col lg="4" class="text-monospace text-truncate">{{value}}</b-col>
                                </template>
                            </list-item>
                            <b-list-group-item class="title-with-bg py-3 px-4">
                                <div>
                                    <h4 class="my-auto">Steering Committee</h4>
                                </div>
                            </b-list-group-item>

                            <list-item v-for="(item, index) in approvers" :key="'c'+index">
                                <template #content>
                                    <b-col lg="2"><strong>#{{index}}</strong></b-col>
                                    <b-col lg="7">
                                        <a :href="'https://explore.vechain.org/accounts/'+item.address"
                                            v-b-tooltip.hover :title="'identity '+item.identity"
                                            class="text-monospace text-truncate" target="_blank">{{item.address}}</a>
                                    </b-col>
                                </template>
                            </list-item>

                            <b-list-group-item class="title-with-bg  py-3 px-4">
                                <div>
                                    <h4 class="my-auto">Authority</h4>
                                </div>
                            </b-list-group-item>
                            <list-item v-for="(item, index) in masternodes" :key="index">
                                <template #content>
                                    <b-col lg="2"><strong>#{{index}}</strong></b-col>
                                    <b-col lg="7"><a class="text-monospace text-truncate"
                                            :href="'https://explore.vechain.org/accounts/'+item.master"
                                            :title="'identity: '+item.identity" v-b-tooltip.hover
                                            target="_blank">{{item.master}}</a>
                                    </b-col>
                                    <b-col lg="1" sm="1">
                                        <span :title="item.active&&item.endorsed?'':item.endorsed?'invalid endorsement':'offline'" v-b-tooltip.hover>
                                            <b-icon-circle-fill
                                                :variant="item.active&&item.endorsed?'success':'danger'">
                                            </b-icon-circle-fill>
                                        </span>
                                    </b-col>
                                    <b-col lg="1" sm="2">
                                        <b-link>DEL</b-link>
                                    </b-col>
                                </template>
                            </list-item>
                        </b-list-group>
                    </b-card>
                </b-overlay>
            </b-container>
        </b-overlay>
        <b-container class="mt-4 mb-4">
            <b-card nobody>
                <template #header>
                    <h4>Add Master Node</h4>
                </template>
                <b-container>
                    <b-form>
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
                        <p class="mt-3 text-monospace text-truncate">Encoded: {{hashed}} </p>
                        <b-button type="submit" variant="primary">Submit</b-button>
                    </b-form>
                </b-container>
            </b-card>
        </b-container>
    </b-container>
</template>
  
<script setup lang="ts">
import { Connex } from '@vechain/connex';
import { computed, inject, reactive, ref } from 'vue';
import { abi, blake2b256 } from 'thor-devkit'
import { AuthUtils, Params } from '../contracts';
import { Executor } from '../contracts/executor';

const connex = inject<Connex>('$connex')!
const loading = ref(false)

const paramsData: { [index: string]: string } = reactive({
    BaseGasPrice: '-',
    RewardRatio: '-',
    ProposerEndorsement: '-',
    MaxBlockPropers: '-',
})

const approvers = ref<{ address: string; identity: string }[]>([])
const masternodes = ref<AuthUtils.MasterNode[]>([])

const params = {
    get: new abi.Function(Params.methods.get as any)
}
const executor = {
    Approvers: connex.thor.account(Executor.address).event(Executor.events.Approvers).filter([]).cache([Executor.address]),
    approvers: new abi.Function(Executor.methods.approvers as any)
}
const loadData = async () => {
    loading.value = true

    await Promise.all([
        (async () => {
            const ret = await connex.thor.explain([
                {
                    to: Params.address,
                    value: 0,
                    data: params.get.encode(Params.keys.baseGasPrice)
                },
                {
                    to: Params.address,
                    value: 0,
                    data: params.get.encode(Params.keys.rewardRatio)
                },
                {
                    to: Params.address,
                    value: 0,
                    data: params.get.encode(Params.keys.proposerEndorsement)
                },
                {
                    to: Params.address,
                    value: 0,
                    data: params.get.encode(Params.keys.maxBlockPropers)
                }
            ]).cache([Params.address]).execute()

            let decoded = params.get.decode(ret[0].data)
            const v1 = parseInt(decoded['0']).toLocaleString() + ' WEI'
            decoded = params.get.decode(ret[1].data)
            const v2 = (parseInt(decoded['0']) / 1e18).toString()
            decoded = params.get.decode(ret[2].data)
            const v3 = (BigInt(decoded['0']) / BigInt(1e18)).toLocaleString() + ' VET'
            decoded = params.get.decode(ret[3].data)
            const v4 = parseInt(decoded['0'])

            paramsData.BaseGasPrice = v1
            paramsData.RewardRatio = v2
            paramsData.ProposerEndorsement = v3
            if (v4 !== 0) {
                paramsData.MaxBlockPropers = v4.toString()
            } else {
                paramsData.MaxBlockPropers = '101'
            }
        })(),
        (async () => {
            approvers.value = []
            let offset = 0
            const step = 40
            const revoked = new Set<string>()
            const addrs: string[] = []
            for (; ;) {
                const filtered = await executor.Approvers.apply(offset, step)
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
                    data: executor.approvers.encode(address)
                })
            }
            const ret = await connex.thor.explain(clauses).cache([Executor.address]).execute()
            for (const [index, address] of inPower.entries()) {
                const decoded = executor.approvers.decode(ret[index].data)
                approvers.value.push({
                    address,
                    identity: decoded['identity']
                })
            }

        })(),
        (async () => {
            masternodes.value = []
            masternodes.value = await AuthUtils.ListAll(connex.thor)
        })()
    ])

    loading.value = false
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

loadData().catch()
</script>

<style>
.title-with-bg {
    background-color: rgba(0, 0, 0, 0.03);
}
</style>
  

