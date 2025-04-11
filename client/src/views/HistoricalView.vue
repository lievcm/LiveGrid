<script setup>
import DataSelectorWidget from '@/components/historical/DataSelectorWidget.vue';
import HistoricalGraphWidget from '@/components/historical/HistoricalGraphWidget.vue';

</script>

<template>
    <div class="data-selector-widget">
        <DataSelectorWidget />
    </div>
    <div class="graph-widget">
        <HistoricalGraphWidget />
    </div>
</template>

<style scoped>

.data-selector-widget {
    position: fixed;
    left: 85px;
    top: 78px;
    width: 320px;
    height: calc(100vh - 96px);
}

.graph-widget {
    position: fixed;
    left: 425px;
    top: 78px;
    width: calc(100vw - 445px);
    height: calc(100vh - 96px);
}

</style>