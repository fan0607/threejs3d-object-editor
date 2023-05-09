<template>
  <div :id="id" class="box">
    <div class="pine"></div>
    <div class="box-wrap">
      <!-- <div class="close" @click="closeClick">X</div> -->
      <div class="circleClose" @click="closeClick">
        <i class="el-icon-circle-close"></i>
      </div>
      <div class="area">
        <div class="area-title fontColor">{{ title }}</div>
      </div>
      <div class="content">
        <template v-for="(val, key, index) in itemproperties">
          <div class="data-li" :key="index" v-if="index < 6">
            <div class="data-label textColor">{{key}} :</div>
            <div class="data-value">
              <span class="label-num yellowColor">{{val}}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- <img src="./layer_border.png" alt="Norway"> -->
  </div>
</template>

<script>
export default {
  name: "DynamicLabel",
  data() {
    return {
      show: true,
    };
  },
  props: {
    id: {
      type: String,
      default: "001",
    },
    title: {
      type: String,
      default: "001",
    },
    itemproperties: {
      type: Object,
      default: {},
    },
  },
  methods: {
    closeClick() {
      if (this.closeEvent) {
        this.closeEvent();
        this.$bus.$emit("destroyedLabelEntity", true);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.circleClose {
  position: absolute;
  right: 0px;
  top: 0px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  /* Firefox */
  -webkit-box-sizing: border-box;
  /* Safari */
  text-align: center;
  line-height: 28px;
  z-index: 102;
  //border: 1px solid #fff;
  transition: transform 0.3s;
  color: #fff;
  &:hover {
    cursor: pointer;
    transform: scale(1.5);
  }
}

.box {
  width: 200px;
  position: relative;
  bottom: 0;
  left: 0;
}
.close {
  position: absolute;
  color: #fff;
  top: 1px;
  right: 10px;
  text-shadow: 2px 2px 2px #022122;
  cursor: pointer;
  animation: fontColor 1s;
}
.box-wrap {
  position: absolute;
  left: 21%;
  top: 0;
  width: 100%;
  height: 163px;
  //height: 200px;
  border-radius: 50px 0px 50px 0px;
  border: 1px solid #38e1ff;
  background-color: #38e1ff4a;
  box-shadow: 0 0 10px 2px #29baf1;
  animation: slide 2s;
}
.box-wrap .area {
  position: absolute;
  top: 20px;
  right: 0;
  width: 95%;
  height: 30px;
  background-image: linear-gradient(to left, #4cdef9, #4cdef96b);
  border-radius: 30px 0px 0px 0px;
  animation: area 1s;
}
.pine {
  position: absolute;
  // left: 0;
  // bottom: -83px;
  width: 100px;
  height: 100px;
  box-sizing: border-box;
  line-height: 120px;
  text-indent: 5px;
}

.pine::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: -83px;
  width: 40%;
  height: 60px;
  box-sizing: border-box;
  border-bottom: 1px solid #38e1ff;
  transform-origin: bottom center;
  transform: rotateZ(135deg) scale(1.5);
  animation: slash 0.5s;
  filter: drop-shadow(1px 0px 2px #03abb4);
  /* transition: slash 2s; */
}

.area .area-title {
  text-align: center;
  line-height: 30px;
}
.textColor {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 1px 1px 5px #002520d2;
  animation: fontColor 1s;
}
.yellowColor {
  font-size: 14px;
  font-weight: 600;
  color: #f09e28;
  text-shadow: 1px 1px 5px #002520d2;
  animation: fontColor 1s;
}

.fontColor {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 1px 1px 5px #002520d2;
  animation: fontColor 1s;
}
.content {
  padding: 55px 10px 10px 10px;
}
.content .data-li {
  display: flex;
}

@keyframes fontColor {
  0% {
    color: #ffffff00;
    text-shadow: 1px 1px 5px #00252000;
  }
  40% {
    color: #ffffff00;
    text-shadow: 1px 1px 5px #00252000;
  }
  100% {
    color: #ffffff;
    text-shadow: 1px 1px 5px #002520d2;
  }
}

@keyframes slide {
  0% {
    border: 1px solid #38e1ff00;
    background-color: #38e1ff00;
    box-shadow: 0 0 10px 2px #29baf100;
  }

  100% {
    border: 1px solid #38e1ff;
    background-color: #38e1ff4a;
    box-shadow: 0 0 10px 2px #29baf1;
  }
}

@keyframes area {
  0% {
    width: 0%;
  }
  25% {
    width: 0%;
  }

  100% {
    width: 95%;
  }
}

/* img{
            position:absolute;
            left:30%;
            top:0;
            width: 100%;
            box-shadow: 0 0 10px 2px #29baf1;
        } */

@keyframes slash {
  0% {
    transform: rotateZ(135deg) scale(0);
  }

  100% {
    transform: rotateZ(135deg) scale(1.5);
  }
}
</style>
