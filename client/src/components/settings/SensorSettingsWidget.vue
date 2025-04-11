<script setup>

</script>

<template>
    <div class="widget">
        <div class="title">Sensor Configuration</div>
        <div class="divider"></div>
        <div class="body"></div>
    </div>
</template>

<style scoped>
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
    box-shadow: 0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
}

.divider {
    flex-basis: 1px;
    flex-shrink: 0;
    background-color: var(--sidebar-accent-color);
}

.title {
    height: 30px;
    background-color: var(--sidebar-bg-color);
    color: var(--sidebar-accent-color);

    font-size: 19px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
}

.body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
}
</style>