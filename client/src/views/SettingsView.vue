<script setup>
import SensorSettingsWidget from '@/components/settings/SensorSettingsWidget.vue';
import SiteSettingsWidget from '@/components/settings/SiteSettingsWidget.vue';

</script>

<template>
    <div class="container">
        <div class="site-settings">
            <SiteSettingsWidget />
        </div>
        <div class="spacer"></div>
        <div class="sensor-settings">
            <SensorSettingsWidget />
        </div>
    </div>
</template>

<style scoped>

.container {
    position: fixed;
    left: 85px;
    top: 78px;
    width: calc(100vw - 105px);
    height: calc(100vh - 96px);
    display: flex;
}

.spacer {
    width: 20px;
}

.site-settings {
    flex: 1;
}

.sensor-settings {
    flex: 1;
}
</style>