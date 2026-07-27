import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from './AppHeader.vue';
import i18n from '../i18n';
import { setLocale } from '../i18n';

beforeEach(() => {
  localStorage.clear();
  setLocale('zh');
});

describe('AppHeader', () => {
  it('renders the logo image', () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    expect(w.find('img.logo').attributes('src')).toBe('/images/logo.png');
  });

  it('clicking EN switches zh -> en', async () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    expect(w.find('button.lang-zh').classes()).toContain('active');
    await w.find('button.lang-en').trigger('click');
    expect(w.find('button.lang-en').classes()).toContain('active');
  });

  it('ecosystem link points to chat.z.ai/auth', () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    const a = w.find('a.btn-ecosystem');
    expect(a.exists()).toBe(true);
    expect(a.attributes('href')).toBe('https://chat.z.ai/auth');
    expect(a.attributes('target')).toBe('_blank');
  });
});
