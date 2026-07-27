import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TokenLoginModal from './TokenLoginModal.vue';
import i18n from '../i18n';
import { setLocale } from '../i18n';

beforeEach(() => {
  localStorage.clear();
  setLocale('zh');
  vi.restoreAllMocks();
});

function makeFetch(status: number, body: unknown) {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  ) as unknown as typeof fetch;
}

describe('TokenLoginModal', () => {
  it('shows empty error when submitting with no token', async () => {
    const w = mount(TokenLoginModal, { props: { open: true }, global: { plugins: [i18n] } });
    await w.find('form').trigger('submit');
    expect(w.find('.error').text()).toContain('请先输入');
  });

  it('shows invalid error on 401', async () => {
    global.fetch = makeFetch(401, { message: '401' });
    const w = mount(TokenLoginModal, { props: { open: true }, global: { plugins: [i18n] } });
    await w.find('input').setValue('bad');
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(w.find('.error').text()).toContain('无效或已过期');
  });

  it('stores auth and emits success on 200 active', async () => {
    global.fetch = makeFetch(200, {
      id: 2,
      username: 'qiuyl4',
      name: 'qiuyl4',
      email: 'q@l.com',
      state: 'active',
      avatar_url: '',
      web_url: '',
    });
    const w = mount(TokenLoginModal, { props: { open: true }, global: { plugins: [i18n] } });
    await w.find('input').setValue('good');
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(w.emitted('success')).toBeTruthy();
    expect(localStorage.getItem('byclaw_auth')).toContain('qiuyl4');
  });
});
