function resolveTimeZone(timeZone?: string) {
  if (!timeZone) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

export function formatTimeByTimeZone(value: string | number | Date, timeZone?: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: resolveTimeZone(timeZone),
  });
}

export function formatDateTimeByTimeZone(value: string | number | Date, timeZone?: string) {
  return new Date(value).toLocaleString("en-US", {
    timeZone: resolveTimeZone(timeZone),
  });
}

export function formatShortDateTimeByTimeZone(value: string | number | Date, timeZone?: string) {
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: resolveTimeZone(timeZone),
  });
}
