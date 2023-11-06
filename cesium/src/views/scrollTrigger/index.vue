<template>
<div class="container">
    <Login class="panel"/>
    <Login class="panel bg-cyan-400"/>

</div>
</template>

<script setup>
import Login from "@/views/login/Login.vue";
import InitCesium from "@/views/cesium/InitCesium.vue";

import { onMounted } from 'vue';
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {TextPlugin} from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(TextPlugin)

onMounted(()=>{
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.defaults({
        toggleActions: "restart pause resume pause",
        scroller: ".container"
    });
    //WITH Timelines (cleaner, more versatile)
    var tl = gsap.timeline({repeat: 2, repeatDelay: 1});

    tl.to(".bg-cyan-400 .config", {
        scrollTrigger: ".bg-cyan-400 .loginMain", 
        duration: 2, 
        rotation: 360,
    }).to(".bg-cyan-400 .loginTop .title", {
      duration: 4,
      text: "展通佳创智慧燃气安全在线",
      delay: 1,
    })

})
</script>

<style scoped>
.container {
    max-height: 100vh;
	overflow-y: scroll;
    scroll-snap-type: y mandatory;
}
.panel{
    scroll-snap-align: start;
    height: 100vh;
}
</style>
