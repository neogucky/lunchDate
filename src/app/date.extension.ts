export {};

// DATE EXTENSIONS
// ================

declare global {
  interface Date {
    getWeekNumber(): number;
  }
}

Date.prototype.getWeekNumber = function() {
  let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  let dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime()	 - yearStart.getTime()	) / 86400000) + 1) / 7);
};
