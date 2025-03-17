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
body {
  background-color: #4b4b4b;
  margin: 0px;
}

.content {
  margin-left: 65px;
  margin-top: 60px;
  padding: 10px;
}
</style>
