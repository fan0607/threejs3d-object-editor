<template>
    <div id="container">
        <div class="mainDiv1">
            <div class="title"></div>
        </div>
        <div class="mainDiv2"></div>
    </div>
    
</template>

<script setup>
import { onMounted } from 'vue';
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {TextPlugin} from "gsap/TextPlugin";
onMounted(() => {
    gsap.registerPlugin(TextPlugin, ScrollTrigger);
    gsap.to(".el-menu--collapse", {
        scrollTrigger: {
            trigger: ".mainDiv1",
            scroller: "#container",
            start: "top center",  // When .mainDiv2 enters the bottom of the viewport
            end: "bottom center",  // When .mainDiv2 exits the top of the viewport
            scrub: 1,
            markers: false,
        },
        display: 'false',
        ease: "power4.out",
    });
    gsap.to(".title", {
        scrollTrigger: {
            trigger: ".mainDiv1",
            scroller: "#container",
            start: "top bottom",  // When .mainDiv2 enters the bottom of the viewport
            end: "bottom top",  // When .mainDiv2 exits the top of the viewport
            scrub: 1,
            onEnterBack: titleText,
            markers: false,
        },
        rotate: 360,
        opacity: "1",
        ease: "power4.out",
    });
    gsap.to(".el-menu--collapse", {
        scrollTrigger: {
            trigger: ".mainDiv2",
            scroller: "#container",
            start: "top bottom",  // When .mainDiv2 enters the bottom of the viewport
            end: "bottom top",  // When .mainDiv2 exits the top of the viewport
            scrub: 1,
            markers: false,
        },
        display: "block",
        opacity: "1",
        ease: "power4.out",
    });
    titleText();
});
function titleText() {
    gsap.to(".title", {
        duration: 2,
        text: "Hello World!",
        ease: "none",
    });
}


</script>

<style lang="scss" scoped>
#container{
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    .mainDiv1 {
        scroll-snap-align: start;
        height: 100vh;
        display: flex;
        justify-content: center;
        /* 背景图片 */
        background-image: url(../../assets/01.png);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }
    .mainDiv2 {
        scroll-snap-align: start;
        height: 100vh;
        /* 背景图片 */
        background-image: url(../../assets/02.png);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }
}
.title{
    font-size: 50px;
    color: #fff;
    text-align: center;
    margin-top: 60vh;
    font-weight: bold;
    text-shadow: 0 0 10px #000;
    //不允许字体选择
    -webkit-user-select: none;
    cursor: pointer;

}

</style>
