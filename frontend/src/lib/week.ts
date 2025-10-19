export type WeekInfo = {
  weekStart: Date; // понедельник 00:00
  weekEnd: Date;   // воскресенье 23:59:59.999
  isoWeek: number; // номер недели по ISO
  label: string;   // "13–19 окт"
};

// понедельник для даты (локально)
export function startOfISOWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // 0..6, где 0 = пн
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}
export function endOfISOWeek(d: Date) {
  const start = startOfISOWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
export function getISOWeekNumber(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // четверг текущей недели
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}
export function shortMonthName(date: Date) {
  return date.toLocaleString("ru-RU", { month: "short" }).replace(".", "");
}
export function getWeekInfo(base: Date = new Date()): WeekInfo {
  const start = startOfISOWeek(base);
  const end = endOfISOWeek(base);
  const iso = getISOWeekNumber(base);
  const label =
    `${start.getDate()}–${end.getDate()} ${shortMonthName(end)}`;
  return { weekStart: start, weekEnd: end, isoWeek: iso, label };
}