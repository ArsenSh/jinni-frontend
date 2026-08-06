<template>
  <div class="day-sky" ref="skyContainer">
    <div class="cloud-layer" v-for="(layer, index) in cloudLayers" :key="'layer-'+index"
         :style="{
           'animation-duration': layer.duration + 's',
           'animation-delay': layer.delay + 's',
           'opacity': layer.opacity
         }">
      <img
          v-for="(cloud, cloudIndex) in layer.clouds"
          :key="'cloud-'+index+'-'+cloudIndex"
          :src="cloud.src"
          alt="cloud"
          class="cloud"
          :style="{
            width: cloud.size + 'px',
            left: cloud.left + '%',
            top: cloud.top + '%',
            opacity: cloud.opacity,
            transform: `rotate(${cloud.rotation}deg)`,
            'animation-name': `vertical-drift-${cloudIndex}`
          }"
      />
    </div>
  </div>
</template>


<script>
import { onMounted, ref } from 'vue';
export default {
  setup() {
    const skyContainer = ref(null);
    const cloudLayers = ref([]);
    const cloudImages = [
      '/images/cloud1.png', '/images/cloud2.png', '/images/cloud3.png',
      '/images/cloud4.png', '/images/cloud5.png', '/images/cloud6.png',
      '/images/cloud7.png', '/images/cloud8.png', '/images/cloud9.png',
      '/images/cloud10.png', '/images/cloud11.png', '/images/cloud12.png',
      '/images/cloud13.png', '/images/cloud14.png'
    ];
    const generateCloudLayers = () => {
      const layers = [];
      for (let layerIndex = 0; layerIndex < 3; layerIndex++) {
        const layer = {
          duration: 300 + Math.random() * 200,
          delay: Math.random() * 30,
          opacity: 1,
          clouds: []
        };
        let cloudCount, minSize, maxSize;
        switch(layerIndex) {
          case 0:
            cloudCount = 8;
            minSize = 180;
            maxSize = 280;
            break;
          case 1:
            cloudCount = 12;
            minSize = 250;
            maxSize = 400;
            break;
          case 2:
            cloudCount = 6;
            minSize = 350;
            maxSize = 600;
            break;
        }
        for (let i = 0; i < cloudCount; i++) {
          layer.clouds.push({
            src: cloudImages[Math.floor(Math.random() * cloudImages.length)],
            size: minSize + Math.random() * (maxSize - minSize),
            left: Math.random() * 120 - 10,
            top: 5 + Math.random() * 80,
            opacity: 1,
            rotation: -2 + Math.random() * 4,
            verticalOffset: 0.5 + Math.random() * 1.5
          });
        }
        layers.push(layer);
      }
      cloudLayers.value = layers;
    };
    onMounted(() => {
      generateCloudLayers();
      if (skyContainer.value) {
        skyContainer.value.style.height = `${document.documentElement.scrollHeight}px`;
      }
    });
    return {
      skyContainer,
      cloudLayers
    };
  }
}
</script>


<style scoped>
.day-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(to bottom, #1a5798 0%, #2d7bb8 30%, #5bb1e4 70%, #a8d9f0 100%);
  transition: background 10s linear;
}
.cloud-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: drift linear infinite;
}
.cloud {
  position: absolute;
  transform-origin: center;
  animation: vertical-drift linear infinite;
  will-change: transform;
  user-select: none;
  pointer-events: none;
}
@keyframes drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(100vw); }
}
@keyframes vertical-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(2vh); }
}
@media (max-width: 768px) {
  .cloud-layer {
    animation-duration: 150s!important;
  }
  .cloud {
    max-width: 280px;
  }
}
</style>