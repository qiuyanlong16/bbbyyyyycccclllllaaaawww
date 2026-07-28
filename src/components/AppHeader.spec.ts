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

  it('does not render ecosystem button', () => {
    const w = mount(AppHeader, { global: { plugins: [i18n] } });
    expect(w.find('.btn-ecosystem').exists()).toBe(false);
  });
});
