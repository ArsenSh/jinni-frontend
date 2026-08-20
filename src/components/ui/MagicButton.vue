<template>
  <!-- The native event MUST be forwarded: listeners like
       @click.prevent="savePreferences" (OnboardingPage) are wrapped by Vue in
       withModifiers, which calls e.preventDefault() — an emit without $event
       made that throw "undefined is not an object (evaluating 'e.preventDefault')". -->
  <button class="magic-button" @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'MagicButton',
  // Declaring the emit stops Vue's fallthrough from ALSO binding the parent's
  // @click natively to this button — undeclared, every click fired twice
  // (once native, once via $emit).
  emits: ['click'],
};
</script>

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