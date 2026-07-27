import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import VideoModal from './VideoModal.vue';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('VideoModal', () => {
  it('renders video element when open', () => {
    const w = mount(VideoModal, { props: { open: true } });
    expect(w.find('video').exists()).toBe(true);
    expect(w.find('video').attributes('src')).toBe('/videos/hero-full.mp4');
  });

  it('does not render when closed', () => {
    const w = mount(VideoModal, { props: { open: false } });
    expect(w.find('video').exists()).toBe(false);
  });

  it('emits close on Escape (window keydown)', async () => {
    const w = mount(VideoModal, { props: { open: true } });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();
    expect(w.emitted('close')).toBeTruthy();
  });

  it('emits close when backdrop clicked', async () => {
    const w = mount(VideoModal, { props: { open: true } });
    await w.find('.modal-backdrop').trigger('click');
    expect(w.emitted('close')).toBeTruthy();
  });
});
