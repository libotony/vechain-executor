<template>
    <b-container class="w-75 mx-auto">
        <b-container class="mt-4">
            <b-overlay :show="loading">
                <b-card no-body>
                    <template #header>
                        <div class="d-flex justify-content-between">
                            <h4 class="my-auto">Overview</h4>
                            <span>
                                <b-button variant="primary" pill @click="loadData"><b-icon-arrow-clockwise></b-icon-arrow-clockwise></b-button>
                            </span>
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
                                    <a :href="explorer.account(item.address)" v-b-tooltip.hover
                                        :title="'identity '+item.identity" class="text-monospace text-truncate"
                                        target="_blank">{{item.address}}</a>
                                </b-col>
                            </template>
                        </list-item>

                        <b-list-group-item class="title-with-bg py-3 px-4">
                            <div>
                                <h4 class="my-auto">Authority</h4>
                            </div>
                        </b-list-group-item>
                        <list-item v-for="(item, index) in masternodes" :key="index">
                            <template #content>
                                <b-col lg="2"><strong>#{{index}}</strong></b-col>
                                <b-col lg="7"><a class="text-monospace text-truncate"
                                        :href="explorer.account(item.master)" :title="'identity: '+item.identity"
                                        v-b-tooltip.hover target="_blank">{{item.master}}</a>
                                </b-col>
                                <b-col lg="1" sm="1">
                                    <span
                                        :title="item.active&&item.endorsed?'':item.endorsed?'invalid endorsement':'offline'"
                                        v-b-tooltip.hover>
                                        <b-icon-circle-fill :variant="item.active&&item.endorsed?'success':'danger'">
                                        </b-icon-circle-fill>
                                    </span>
                                </b-col>
                                <b-col lg="1" sm="2">
                                    <b-link @click="revokeMaster(item.master)">DEL</b-link>
                                </b-col>
                            </template>
                        </list-item>
                    </b-list-group>
                </b-card>
            </b-overlay>
        </b-container>
        <tx-modal v-model="showModal" :txid="txReq.txid" :error="txReq.error"></tx-modal>
    </b-container>
</template>
  
<script setup lang="ts">
import { Connex } from '@vechain/connex'
import { inject, ref } from 'vue'
import { abi } from 'thor-devkit'
import { AuthUtils, Params, Executor, getApprovers, Authority } from '../contracts'
import { explorer } from '../config'

const connex = inject<Connex>('$connex')!
const loading = ref(false)

const paramsData = ref({
    BaseGasPrice: '-',
    RewardRatio: '-',
    ProposerEndorsement: '-',
    MaxBlockPropers: '-',
})

const approvers = ref<{ address: string; identity: string }[]>([])
const masternodes = ref<AuthUtils.MasterNode[]>([])

const params = {
    get: new abi.Function(Params.methods.get as abi.Function.Definition)
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

            paramsData.value.BaseGasPrice = v1
            paramsData.value.RewardRatio = v2
            paramsData.value.ProposerEndorsement = v3
            if (v4 !== 0) {
                paramsData.value.MaxBlockPropers = v4.toString()
            } else {
                paramsData.value.MaxBlockPropers = '101'
            }
        })(),
        (async () => {
            approvers.value = await getApprovers(connex)
        })(),
        (async () => {
            masternodes.value = await AuthUtils.ListAll(connex.thor)
        })()
    ])

    loading.value = false
}

const showModal = ref(false)
const txReq = ref<{ error: string, txid: string }>({ error: '', txid: '' })

let session = {}
const revokeMaster = async (addr: string) => {
    const theSession = session = {}

    txReq.value.error = ''
    txReq.value.txid = ''
    if (!showModal.value) {
        showModal.value = true
    }
    try {
        const action = connex.thor.account(Authority.address).method(Authority.methods.revoke).asClause(addr)
        const resp = await connex
            .thor
            .account(Executor.address)
            .method(Executor.methods.propose)
            .transact(action.to, action.data)
            .request()
        if (theSession === session) {
            txReq.value.txid = resp.txid
        }
    } catch (e) {
        if (theSession === session) {
            txReq.value.error = (e as Error).message
        }
    }
}

loadData().catch()
</script>

<style>
.title-with-bg {
    background-color: rgba(0, 0, 0, 0.03);
}
</style>
  

