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

function makeFetch(body: unknown) {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
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

  it('shows error when API returns ok:false', async () => {
    global.fetch = makeFetch({ ok: false, error: 'Token 无效或已过期' });
    const w = mount(TokenLoginModal, { props: { open: true }, global: { plugins: [i18n] } });
    await w.find('input').setValue('bad');
    await w.find('form').trigger('submit');
    await flushPromises();
    expect(w.find('.error').text()).toContain('无效或已过期');
  });

  it('stores auth and redirects on ok:true', async () => {
    global.fetch = makeFetch({
      ok: true,
      user: { name: '张三', username: 'zhangsan' },
    });
    const w = mount(TokenLoginModal, { props: { open: true }, global: { plugins: [i18n] } });
    await w.find('input').setValue('good');
    await w.find('form').trigger('submit');
    await flushPromises();
    // jsdom throws on navigation, but localStorage should be set
    expect(localStorage.getItem('byclaw_auth')).toContain('zhangsan');
  });
});
