<template>
  <section class="sg" :class="theme">
    <div class="sg-head">
      <h2>Guide applications</h2>
      <div class="sg-filter">
        <button v-for="s in statuses" :key="s" type="button" class="sg-pill" :class="{ on: status === s }" @click="status = s; load()">
          {{ s }} <span v-if="counts[s] != null">{{ counts[s] }}</span>
        </button>
      </div>
    </div>
    <p class="sg-help">To verify: open the Instagram profile and check its bio contains the code. Approve only when it does.</p>

    <p v-if="loading" class="sg-muted">Loading…</p>
    <p v-else-if="!guides.length" class="sg-muted">Nothing here.</p>

    <article v-for="g in guides" :key="g.id" class="sg-card">
      <div class="sg-main">
        <h3>{{ g.displayName }} <small>jinni.travel/@{{ g.handle }}</small></h3>
        <p><a :href="`https://www.instagram.com/${g.instagram}/`" target="_blank" rel="noopener">@{{ g.instagram }} ↗</a>
          · bio code <strong class="sg-code">{{ g.verificationCode }}</strong></p>
        <p class="sg-muted">{{ typeLabel(g.guideType) }} · {{ g.region }}<span v-if="g.languages.length"> · {{ g.languages.join(', ') }}</span></p>
        <p v-if="g.bio" class="sg-bio">{{ g.bio }}</p>
        <p class="sg-muted">Account: {{ g.email || '—' }} · applied {{ new Date(g.createdAt).toLocaleDateString() }}</p>
        <p v-if="g.staffNotes" class="sg-muted">Notes: {{ g.staffNotes }}</p>
      </div>
      <div class="sg-actions">
        <template v-if="g.status === 'pending'">
          <button type="button" class="sg-btn approve" :disabled="busy === g.id" @click="act(g, 'approve')">Approve</button>
          <button type="button" class="sg-btn reject" :disabled="busy === g.id" @click="act(g, 'reject')">Reject</button>
        </template>
        <button v-else-if="g.status === 'rejected'" type="button" class="sg-btn approve" :disabled="busy === g.id" @click="act(g, 'approve')">Approve</button>
        <template v-else-if="g.status === 'active'">
          <a :href="`/@${g.handle}`" target="_blank" class="sg-btn">View page</a>
          <button type="button" class="sg-btn reject" :disabled="busy === g.id" @click="act(g, 'suspend')">Suspend</button>
        </template>
        <button v-else-if="g.status === 'suspended'" type="button" class="sg-btn approve" :disabled="busy === g.id" @click="act(g, 'reinstate')">Reinstate</button>
      </div>
    </article>
    <p v-if="error" class="sg-bad">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { guideApi } from '@/utils/guides'

defineProps({ theme: { type: String, default: 'night-mode' } })
const emit = defineEmits(['count'])
const statuses = ['pending', 'active', 'rejected', 'suspended']
const status = ref('pending')
const guides = ref([])
const counts = ref({})
const loading = ref(false)
const busy = ref(null)
const error = ref('')
const typeLabel = (t) => ({ licensed: 'Licensed guide', creator: 'Travel creator', local: 'Local expert' }[t] || t)

async function load() {
  loading.value = true; error.value = ''
  try {
    const r = await guideApi(`/staff/queue?status=${status.value}`)
    guides.value = r.guides || []; counts.value = r.counts || {}
    emit('count', counts.value.pending ?? null)
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

async function act(g, action) {
  let reason = ''
  if (action === 'reject' || action === 'suspend') {
    reason = window.prompt(action === 'reject' ? 'Reason (the applicant will see it):' : 'Reason for suspending:') || ''
    if (!reason.trim()) return
  } else if (action === 'approve' && !window.confirm(`Approve @${g.handle}? Check the code ${g.verificationCode} is in @${g.instagram}'s Instagram bio.`)) return
  busy.value = g.id; error.value = ''
  try { await guideApi(`/staff/${g.id}/${action}`, { method: 'POST', body: { reason } }); await load() } catch (e) { error.value = e.message } finally { busy.value = null }
}

onMounted(load)
defineExpose({ load })
</script>

<style scoped>
.sg { display: grid; gap: 14px; padding: 4px 0 24px; }
.sg-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.sg-head h2 { margin: 0; font-size: 20px; }
.sg-filter { display: flex; gap: 6px; flex-wrap: wrap; }
.sg-pill { font: inherit; font-size: 13px; text-transform: capitalize; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.45); background: transparent; color: inherit; cursor: pointer; }
.sg-pill span { opacity: 0.7; margin-left: 4px; }
.sg-pill.on { background: rgba(212, 175, 55, 0.25); }
.sg-help { margin: 0; font-size: 13px; opacity: 0.75; }
.sg-card { display: flex; justify-content: space-between; gap: 16px; padding: 16px; border-radius: 14px; backdrop-filter: blur(20px) saturate(180%); }
.night-mode .sg-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); }
.day-mode .sg-card { background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(60, 42, 30, 0.08); }
.sg-main { display: grid; gap: 4px; min-width: 0; }
.sg-main h3 { margin: 0; font-size: 17px; }
.sg-main h3 small { font-weight: 400; opacity: 0.65; font-size: 13px; margin-left: 6px; }
.sg-main p { margin: 0; font-size: 14px; line-height: 1.45; }
.sg-main a { color: #D4AF37; }
.sg-code { letter-spacing: 0.05em; padding: 1px 6px; border-radius: 6px; border: 1px dashed #D4AF37; }
.sg-bio { font-style: italic; }
.sg-actions { display: flex; flex-direction: column; gap: 8px; align-items: stretch; flex: 0 0 auto; }
.sg-btn { font: inherit; font-size: 14px; padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.5); background: transparent; color: inherit; cursor: pointer; text-align: center; text-decoration: none; }
.sg-btn.approve { border-color: rgba(46, 160, 90, 0.7); }
.sg-btn.reject { border-color: rgba(200, 60, 50, 0.7); }
.sg-btn:disabled { opacity: 0.5; cursor: default; }
.sg-muted { opacity: 0.7; font-size: 14px; margin: 0; }
.sg-bad { color: #e06b5f; margin: 0; }
@media (max-width: 600px) { .sg-card { flex-direction: column; } .sg-actions { flex-direction: row; flex-wrap: wrap; } }
</style>
