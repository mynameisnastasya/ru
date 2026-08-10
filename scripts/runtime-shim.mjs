// Some restricted preview containers omit optional libuv system calls.
// Keep native metrics/network discovery where available and provide neutral
// values only when those specific calls are blocked by the environment.
import os from "node:os";

const originalMemoryUsage = process.memoryUsage.bind(process);
const originalRss = process.memoryUsage.rss?.bind(process.memoryUsage);

function safeMemoryUsage() {
  try {
    return originalMemoryUsage();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 };
  }
}

safeMemoryUsage.rss = function safeRss() {
  try {
    return originalRss ? originalRss() : originalMemoryUsage().rss;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return 0;
  }
};

Object.defineProperty(process, "memoryUsage", {
  configurable: true,
  value: safeMemoryUsage,
});

const originalNetworkInterfaces = os.networkInterfaces.bind(os);
os.networkInterfaces = function safeNetworkInterfaces() {
  try {
    return originalNetworkInterfaces();
  } catch (error) {
    if (error?.code !== "ERR_SYSTEM_ERROR") throw error;
    return {};
  }
};
