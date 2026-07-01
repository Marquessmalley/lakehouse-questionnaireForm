import { STORAGE_KEY } from "./config.js";

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasDraft() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
