<script setup>
import { ref, useTemplateRef, watch, watchEffect } from 'vue';


const model = defineModel({default: new Date()});

const hours = ref(model.value.getHours());
const minutes = ref(model.value.getMinutes());
const seconds = ref(model.value.getSeconds());

const $refs = {
    hrs: null,
    mins: null,
    secs: null
}

$refs.hrs = useTemplateRef('hrs');
$refs.mins = useTemplateRef('mins');
$refs.secs = useTemplateRef('secs');

watchEffect(async () => {
    hours.value = model.value.getHours();
    minutes.value = model.value.getMinutes();
    seconds.value = model.value.getSeconds();
});


watch(hours, async () => {
    model.value = new Date(model.value.setHours(hours.value));
})

watch(minutes, async () => {
    model.value = new Date(model.value.setMinutes(minutes.value));
})

watch(seconds, async () => {
    model.value = new Date(model.value.setSeconds(seconds.value));
})

function validateHours(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 13) {
        $refs.mins.value.focus();
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
    }
    if (hours.value == 2 && charCode > 51) {
        evt.preventDefault();
    }
    if (hours.value.toString().length > 1) {
        evt.preventDefault();
    }
}

function validateMinutes(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 13) {
        $refs.secs.value.focus();
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
    }
    if (minutes.value > 5) {
        evt.preventDefault();
    }
    if (minutes.value.toString().length > 1) {
        evt.preventDefault();
    }
}

function validateSeconds(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
    }
    if (seconds.value > 5) {
        evt.preventDefault();
    }
    if (seconds.value.toString().length > 1) {
        evt.preventDefault();
    }
}

</script>

<template>
    <div class="time-picker">
        <div class="hours picker-item">
            <button @click="hours++"> < </button>
            <input type="text" ref="hrs" v-model="hours" @keypress="validateHours">
            <button @click="hours--"> > </button>
        </div>
        :
        <div class="minutes picker-item">
            <button @click="minutes++"> < </button>
            <input type="text" ref="mins" v-model="minutes" @keypress="validateMinutes">
            <button @click="minutes--"> > </button>
        </div>
        :
        <div class="seconds picker-item">
            <button @click="seconds++"> < </button>
            <input type="text" ref="secs" v-model="seconds" @keypress="validateSeconds">
            <button @click="seconds--"> > </button>
        </div>
    </div>
</template>

<style scoped>
*:focus-visible {
    outline: none;
}

.time-picker {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;

    font-weight: 700;
    font-size: 22px;
}

.picker-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex: 1;
}

input {
    width: 25px;

    font-size: 16px;
    text-align: center;
    color: white;

    background-color: #2d2d2d;
    border: 0.5px solid var(--sidebar-accent-color);
    border-radius: 2px;
    box-shadow: inset 0px 0px 3px 0.2px rgba(1, 88, 138, 0.55);
}

button {
    transform: rotate(90deg);
    padding: 0px;
    padding-bottom: 3px;
    padding-left: 2px;
    padding-right: 2px;
    font-size: 10px;
    margin: 3px;

    background-color: var(--sidebar-bg-color);
    border: 1px solid var(--sidebar-accent-color);
    border-radius: 2px;
    color: white;

    cursor: pointer;
}

button:hover {
    background-color: var(--sidebar-item-hover);
}
</style>