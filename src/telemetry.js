const STORAGE_KEY = "ip_runner_telemetry_v1";
const USER_KEY = "ip_runner_anonymous_id";
let memoryAnonymousId = null;
let memoryQueue = [];

function canUseStorage() {
  try {
    const probeKey = "__ip_runner_probe__";
    localStorage.setItem(probeKey, "1");
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

const storageEnabled = canUseStorage();

function getOrCreateAnonymousId() {
  if (storageEnabled) {
    try {
      const existing = localStorage.getItem(USER_KEY);
      if (existing) {
        return existing;
      }

      const generated = `anon_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(USER_KEY, generated);
      return generated;
    } catch {
      // Fallback to memory-only id.
    }
  }

  if (memoryAnonymousId) {
    return memoryAnonymousId;
  }

  memoryAnonymousId = `anon_${Math.random().toString(36).slice(2, 10)}`;
  return memoryAnonymousId;
}

export function createTelemetryClient({ appVersion }) {
  const anonymousId = getOrCreateAnonymousId();
  let queue = [];
  let sessionIndex = 0;

  if (storageEnabled) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      queue = saved ? JSON.parse(saved) : [];
    } catch {
      queue = [];
    }
  } else {
    queue = memoryQueue.slice();
  }

  function persist() {
    if (storageEnabled) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-300)));
        return;
      } catch {
        // Fall through to memory mode.
      }
    }
    memoryQueue = queue.slice(-300);
  }

  function emit(type, payload = {}) {
    sessionIndex += 1;
    const event = {
      eventType: type,
      userId: anonymousId,
      characterId: payload.characterId ?? "unknown",
      stageId: payload.stageId ?? null,
      timestamp: new Date().toISOString(),
      appVersion,
      sessionEventIndex: sessionIndex,
      ...payload
    };

    queue.push(event);
    persist();
    return event;
  }

  function readRecent(limit = 30) {
    return queue.slice(-limit);
  }

  return {
    anonymousId,
    emit,
    readRecent
  };
}
