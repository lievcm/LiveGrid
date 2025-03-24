<script setup>
import L from "leaflet"
import { onMounted, ref } from "vue";
import 'leaflet/dist/leaflet.css'

const map = ref();


onMounted(() => {
    map.value = L.map("overview-map", {scrollWheelZoom: false}).setView([51.0477, -114.0719], 11);
    L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
    }).addTo(map.value)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
    }).addTo(map.value)
})
</script>

<template>
    <div class="widget">
        <div class="title">
            Sensor Locations
        </div>
        <div class="divider"></div>
        <div class="body">
            <div id="overview-map"></div>
        </div>
    </div>
</template>

<style scoped>
:deep(.leaflet-control-attribution) {
    background-color: var(--sidebar-item-hover);
}

:deep(.leaflet-bar a) {
    background-color: var(--sidebar-item-hover);
}

:deep(.leaflet-control-zoom) {

    border-color: var(--sidebar-accent-color);
    border-width: 1px;
    border-radius: 10px;
    overflow: hidden;

    box-shadow:  0px 0px 6px 0.2px rgba(1, 88, 138, 0.55);
}

:deep(.leaflet-control-zoom-in) {
    background-color: var(--sidebar-item-hover);
    border-bottom-color: var(--sidebar-accent-color);
    border-bottom-width: 1px;
    color: var(--sidebar-accent-color);
}

:deep(.leaflet-control-zoom-out) {
    background-color: var(--sidebar-item-hover);
    color: var(--sidebar-accent-color);
}

:deep(.leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover) {
    background-color: var(--sidebar-item-active);
}

:deep(.leaflet-control-zoom-out:hover) {
    background-color: var(--sidebar-item-active);
}

#overview-map {
    background-color: var(--widget-bg-color);
}

.widget {
    background-color: var(--widget-bg-color);
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    font-family: Arial, Helvetica, sans-serif;
    overflow: hidden;

    border-width: 1px;
    border-color: var(--sidebar-accent-color);
    border-style: solid;
    border-radius: 8px;
    box-shadow:  0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
}

.divider {
    height: 1px;
    background-color: var(--sidebar-accent-color);
}

.title {
    height: 30px;
    background-color: var(--sidebar-bg-color);
    color: var(--sidebar-accent-color);

    font-size: 21px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
}

.body {
    flex: 1;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.body #overview-map {
    width: 100%;
    height: 100%;
}
</style>