<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { validateToken, type TokenError } from '../lib/gitlab';
import { saveAuth } from '../composables/useAuth';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>();

const { t, tm } = useI18n();
const token = ref('');
const submitting = ref(false);
const errorKey = ref<TokenError | 'empty' | null>(null);
const showHelp = ref(false);

const gitlabUrl = import.meta.env.VITE_GITLAB_URL;
const partnerUrl = import.meta.env.VITE_PARTNER_URL;
const testToken = import.meta.env.DEV ? import.meta.env.VITE_TEST_TOKEN || '' : '';

const errorMsg = computed(() => (errorKey.value ? t(`login.errors.${errorKey.value}`) : ''));

async function submit() {
  errorKey.value = null;
  if (!token.value.trim()) {
    errorKey.value = 'empty';
    return;
  }
  submitting.value = true;
  const result = await validateToken(gitlabUrl, token.value.trim());
  submitting.value = false;
  if (result.ok && result.user) {
    saveAuth(token.value.trim(), result.user);
    emit('success');
    window.location.href = partnerUrl;
    return;
  }
  errorKey.value = result.error ?? 'unknown';
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close');
}

const helpSteps = computed(() => {
  const raw = tm('login.helpSteps') as unknown;
  return Array.isArray(raw) ? (raw as string[]) : [];
});

function fillTest() {
  if (testToken) token.value = testToken;
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')" @keydown="onKey" tabindex="-1">
    <div class="modal-card">
      <button class="close-btn" aria-label="close" @click="emit('close')">✕</button>
      <h2 class="title">{{ t('login.title') }}</h2>

      <form @submit.prevent="submit">
        <label class="label">{{ t('login.label') }}</label>
        <div class="input-row">
          <input
            v-model="token"
            type="password"
            class="input"
            :placeholder="t('login.placeholder')"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="button" class="mini" @click="fillTest" v-if="testToken">
            {{ t('login.fillTestToken') }}
          </button>
        </div>

        <p v-if="errorKey" class="error">{{ errorMsg }}</p>

        <button type="submit" class="btn-glass btn-primary submit" :disabled="submitting">
          {{ submitting ? t('login.submitting') : t('login.submit') }}
        </button>
      </form>

      <button class="help-toggle" @click="showHelp = !showHelp">
        {{ t('login.helpTitle') }} <span>{{ showHelp ? '▾' : '▸' }}</span>
      </button>
      <ol v-if="showHelp" class="help">
        <li v-for="(s, i) in helpSteps" :key="i">{{ s }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 28px 26px 24px;
}
.close-btn {
  position: absolute;
  top: 14px; right: 14px;
  background: none; border: none;
  color: var(--text-muted); font-size: 18px; cursor: pointer;
}
.title { font-size: 20px; font-weight: 700; margin: 0 0 18px; }
.label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.input-row { display: flex; gap: 8px; }
.input {
  flex: 1; min-width: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  color: var(--text);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: inherit;
}
.input::placeholder { color: var(--text-faint); }
.mini {
  background: var(--glass); border: 1px solid var(--glass-border);
  color: var(--text); border-radius: 10px; padding: 0 12px; font-size: 12px; cursor: pointer;
}
.error { color: var(--danger); font-size: 13px; margin: 10px 0 0; }
.submit { width: 100%; justify-content: center; margin-top: 16px; }
.help-toggle {
  margin-top: 18px; background: none; border: none; color: var(--text-muted);
  font-size: 13px; cursor: pointer; padding: 0;
}
.help { margin: 10px 0 0; padding-left: 18px; color: var(--text-muted); font-size: 12px; line-height: 1.7; }
@media (max-width: 480px) {
  .modal-backdrop { padding: 0; }
  .modal-card { max-width: none; min-height: 100%; border-radius: 0; padding-top: max(28px, env(safe-area-inset-top)); }
}
</style>
