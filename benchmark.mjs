import { performance } from 'node:perf_hooks';
import * as fs from 'fs';

// Mock simple tools and categories
const categories = Array.from({length: 20}, (_, i) => `Category${i}`);
const tools = Array.from({length: 1000}, (_, i) => ({
  id: i,
  category: categories[i % 20]
}));

const toolsByCategory = categories.reduce((acc, category) => {
  acc[category] = tools.filter((tool) => tool.category === category);
  return acc;
}, {});

const iterations = 100000;

// Baseline
const startBaseline = performance.now();
for (let i = 0; i < iterations; i++) {
  const category = categories[i % 20];
  const items = tools.filter(t => t.category === category);
}
const endBaseline = performance.now();
const baselineMs = endBaseline - startBaseline;

// Optimized
const startOptimized = performance.now();
for (let i = 0; i < iterations; i++) {
  const category = categories[i % 20];
  const items = toolsByCategory[category] || [];
}
const endOptimized = performance.now();
const optimizedMs = endOptimized - startOptimized;

console.log(`Baseline (O(N) filtering): ${baselineMs.toFixed(2)} ms`);
console.log(`Optimized (O(1) lookup): ${optimizedMs.toFixed(2)} ms`);
console.log(`Improvement: ${((baselineMs - optimizedMs) / baselineMs * 100).toFixed(2)}% faster`);
