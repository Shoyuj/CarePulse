/**
 * Safe Time & Date Formatters
 * Handles String ("09:00:00"), Array ([9, 0]), and Object representations from Jackson
 */

export function formatTime(time) {
  if (!time) return '';
  if (typeof time === 'string') {
    return time.length >= 5 ? time.substring(0, 5) : time;
  }
  if (Array.isArray(time)) {
    const hours = String(time[0] || 0).padStart(2, '0');
    const minutes = String(time[1] || 0).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  if (typeof time === 'object') {
    const hours = String(time.hour ?? time.hours ?? 0).padStart(2, '0');
    const minutes = String(time.minute ?? time.minutes ?? 0).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return String(time);
}

export function toApiTimeString(time) {
  if (!time) return '09:00:00';
  if (typeof time === 'string') {
    return time.length === 5 ? `${time}:00` : time;
  }
  if (Array.isArray(time)) {
    const hours = String(time[0] || 0).padStart(2, '0');
    const minutes = String(time[1] || 0).padStart(2, '0');
    const seconds = String(time[2] || 0).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  return formatTime(time) + ':00';
}

export function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.substring(0, 10);
  }
  if (Array.isArray(date)) {
    const year = date[0];
    const month = String(date[1] || 1).padStart(2, '0');
    const day = String(date[2] || 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(date);
}

export function parseSuggestedQuestions(questions) {
  if (!questions) return [];
  if (Array.isArray(questions)) return questions;
  if (typeof questions === 'string') {
    try {
      const parsed = JSON.parse(questions);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return questions.split(';').map((q) => q.trim()).filter(Boolean);
    }
  }
  return [];
}

export function formatInr(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return `₹${num.toLocaleString('en-IN')}`;
}
