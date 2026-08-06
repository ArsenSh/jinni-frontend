<template>
  <button class="magic-button" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<style scoped>
.magic-button {
  background: linear-gradient(45deg, #D4AF37, #FF8C00);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.magic-button:hover {
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}
</style>