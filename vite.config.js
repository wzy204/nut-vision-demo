export default {
  base: './',
  build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
};
