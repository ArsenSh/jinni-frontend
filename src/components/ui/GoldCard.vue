<template>
  <div class="gold-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.gold-card {
  background: linear-gradient(145deg, rgba(25, 25, 35, 0.15), rgba(15, 15, 25, 0.25));
  border: 1.5px solid;
  border-image: linear-gradient(145deg, #d9a770, #c9915f, #b87d4e) 1;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 0 25px rgba(217, 167, 112, 0.15),
    0 0 50px rgba(201, 145, 95, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}



.gold-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    transparent 0%, 
    rgba(217, 167, 112, 0.03) 50%, 
    transparent 100%);
  z-index: 0;
  pointer-events: none;
}

.gold-card > :deep(*) {
  position: relative;
  z-index: 1;
}
</style>