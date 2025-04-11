<template>
  <Sidebar />
  <Header />
  <div class="content">
    <router-view />
  </div>
</template>

<script>
import Sidebar from '@/components/sidebar/Sidebar.vue'
import Header from './components/Header.vue';
export default {
  components: { Sidebar, Header }
}
</script>

<style>
:root {
    --sidebar-bg-color: #444444;
    --sidebar-item-hover: #3a3a3a;
    --sidebar-item-active: #333333;
    --sidebar-accent-color: #1394dd;
    --widget-bg-color: #353535;
}

body {
  background-color: #222222;
  margin: 0px;
}

.content {
  margin-left: 65px;
  margin-top: 56px;
  padding: 10px;
}
</style>
