export type ISODate = string; // 'YYYY-MM-DD'

export interface Task {
  id: string;
  title: string;
  targetMinutes: number; // 5 часов = 300
  weekStart: ISODate;    // начало недели (пн)
  carryoverFrom?: ISODate | null;
  totalLogged: number;   // пока 0; добавим логи позже
}