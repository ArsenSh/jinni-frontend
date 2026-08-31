<template>
  <div class="fd">
    <button type="button" class="fd-btn" :class="{ 'fd-btn--set': isSet }" @click.stop="open = !open">
      <span class="fd-label">{{ current }}</span>
      <svg class="fd-chev" :class="{ rot: open }" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <transition name="fd-fade">
      <div v-if="open" class="fd-menu" @click.stop>
        <button v-for="o in options" :key="String(o.value)" type="button" class="fd-item" :class="{ sel: o.value === modelValue }" @click="pick(o)">
          <svg v-if="o.value === modelValue" class="fd-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else class="fd-spacer"></span>
          {{ o.label }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
/* Compact filter control for the admin: a single button showing the current
 * choice; clicking opens a themed picker. Replaces the long inline pill rows
 * wherever a filter has more than ~3 options. First option = the default
 * ("All …"); any other selection highlights the button. */
export default {
  name: 'FilterDropdown',
  props: {
    modelValue: { default: '' },
    options: { type: Array, required: true },   // [{ value, label }]
    label: { type: String, default: 'Select' }
  },
  emits: ['update:modelValue', 'change'],
  data: () => ({ open: false }),
  computed: {
    current() {
      const o = this.options.find(x => x.value === this.modelValue)
      return o ? o.label : this.label
    },
    isSet() {
      const first = this.options[0]
      return first && this.modelValue !== first.value
    }
  },
  mounted() {
    this._close = () => { this.open = false }
    document.addEventListener('click', this._close)
  },
  beforeUnmount() { document.removeEventListener('click', this._close) },
  methods: {
    pick(o) {
      this.open = false
      if (o.value !== this.modelValue) {
        this.$emit('update:modelValue', o.value)
        this.$emit('change', o.value)
      }
    }
  }
}
</script>

<style scoped>
.fd { position: relative; display: inline-block; }
.fd-btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: none; cursor: pointer; border-radius: 10px; padding: 8px 13px;
  font-size: 0.75rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
  transition: all 0.15s; white-space: nowrap;
}
.fd-chev { transition: transform 0.2s; opacity: 0.6; flex-shrink: 0; }
.fd-chev.rot { transform: rotate(180deg); }
.fd-menu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 60;
  min-width: 100%; max-width: min(300px, 86vw); max-height: 280px; overflow-y: auto;
  border-radius: 12px; padding: 5px;
}
.fd-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  background: transparent; border: none; padding: 8px 12px; border-radius: 8px;
  font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fd-check { flex-shrink: 0; }
.fd-spacer { width: 12px; flex-shrink: 0; display: inline-block; }
.fd-fade-enter-active, .fd-fade-leave-active { transition: opacity 0.12s, transform 0.12s; }
.fd-fade-enter-from, .fd-fade-leave-to { opacity: 0; transform: translateY(-4px); }

</style>

<style>
/* Theme rules live UNSCOPED: the scoped compiler drops :global()+descendant
 * selectors entirely (verified in the built CSS — same failure as the
 * marketing page). .fd-* class names are unique to this component. */
/* A card containing an OPEN dropdown must stack above the cards that follow
   it — cards create their own stacking contexts, so later DOM order otherwise
   paints the next card over the menu (seen on the Google per-user card). */
.card:has(.fd-menu) { position: relative; z-index: 300; overflow: visible; }

/* Night theme (default admin) */
.admin-shell.night-mode .fd-btn { background: rgba(255,255,255,0.06); color: #cbd5e1; }
.admin-shell.night-mode .fd-btn:hover { background: rgba(139,92,246,0.15); color: #e2e8f0; }
.admin-shell.night-mode .fd-btn--set { background: rgba(139,92,246,0.25); color: #e2e8f0; box-shadow: 0 0 6px rgba(139,92,246,0.25); }
.admin-shell.night-mode .fd-menu { background: #251b46; box-shadow: 0 12px 32px rgba(0,0,0,0.45); }
.admin-shell.night-mode .fd-item { color: #94a3b8; }
.admin-shell.night-mode .fd-item:hover { background: rgba(139,92,246,0.16); color: #e2e8f0; }
.admin-shell.night-mode .fd-item.sel { color: #c084fc; font-weight: 700; }

/* Day theme */
.admin-shell.day-mode .fd-btn { background: rgba(255,255,255,0.9); color: #5c3f2e; box-shadow: 0 0 6px rgba(139,69,19,0.06); }
.admin-shell.day-mode .fd-btn:hover { background: rgba(212,175,55,0.12); color: #2c1e10; }
.admin-shell.day-mode .fd-btn--set { background: rgba(212,175,55,0.25); color: #2c1e10; }
.admin-shell.day-mode .fd-menu { background: #fffdf8; box-shadow: 0 12px 32px rgba(139,69,19,0.18); }
.admin-shell.day-mode .fd-item { color: #5c3f2e; }
.admin-shell.day-mode .fd-item:hover { background: rgba(212,175,55,0.12); color: #2c1e10; }
.admin-shell.day-mode .fd-item.sel { color: #a67c00; font-weight: 700; }
</style>
