<template>
    <b-modal v-model="modal" hide-footer hide-header>
        <div class="text-center p-1 text-break">
            <div v-if="txid">
                <span>
                    Done! <a :href="explorer.transaction(txid)" class="text-monospace"
                        target="_blank">{{txid}}</a>
                </span>
            </div>
            <div v-else-if="error">
                <span class="text-danger">
                    Error: {{error}}
                </span>
            </div>
            <div v-else>
                <b-spinner></b-spinner>
                <div>Requesting...</div>
            </div>
        </div>
    </b-modal>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import { explorer } from '../utils';

const props = defineProps<{
    txid: string;
    error: string;
    value: boolean;
}>()
const emit = defineEmits<{
    (e: 'input', value: boolean): void
}>()

const modal = computed({
    get() {
        return props.value
    },
    set(value) {
        emit('input', value)
    }
})
</script>
  