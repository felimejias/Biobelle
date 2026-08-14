"use client";

import { useMemo, useState } from "react";

type BookingCalendarPickerProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  minDate: string;
};

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function BookingCalendarPicker({
  selectedDate,
  onSelectDate,
  minDate,
}: BookingCalendarPickerProps) {
  const initialDate = useMemo(() => {
    const base = selectedDate || minDate;
    if (base && /^\d{4}-\d{2}-\d{2}$/.test(base)) {
      const [y, m, d] = base.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    return new Date();
  }, [selectedDate, minDate]);

  const [currentYear, setCurrentYear] = useState(() => initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => initialDate.getMonth());

  const minDateObj = useMemo(() => {
    if (minDate && /^\d{4}-\d{2}-\d{2}$/.test(minDate)) {
      const [y, m, d] = minDate.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    return new Date();
  }, [minDate]);

  const canGoPrev = useMemo(() => {
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0, 12, 0, 0);
    return prevMonthLastDay >= minDateObj;
  }, [currentYear, currentMonth, minDateObj]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1, 12, 0, 0);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 12, 0, 0);

    // Monday-based offset (0 = Mon, 6 = Sun)
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isSelected: boolean;
      isSunday: boolean;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0, 12, 0, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum, 12, 0, 0);
      const str = formatIso(d);
      days.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isDisabled: true,
        isSelected: str === selectedDate,
        isSunday: d.getDay() === 0,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum, 12, 0, 0);
      const str = formatIso(d);
      const isSunday = d.getDay() === 0;
      const isBeforeMin = str < minDate;
      const isDisabled = isBeforeMin || isSunday;

      days.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isDisabled,
        isSelected: str === selectedDate,
        isSunday,
      });
    }

    // Next month padding to fill complete weeks (35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(currentYear, currentMonth + 1, dayNum, 12, 0, 0);
      const str = formatIso(d);
      days.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isDisabled: true,
        isSelected: str === selectedDate,
        isSunday: d.getDay() === 0,
      });
    }

    return days;
  }, [currentYear, currentMonth, minDate, selectedDate]);

  return (
    <div className="client-calendar-picker">
      <div className="client-calendar-header">
        <button
          type="button"
          className="calendar-nav-btn"
          disabled={!canGoPrev}
          onClick={handlePrevMonth}
          aria-label="Mes anterior"
          title="Mes anterior"
        >
          ‹
        </button>
        <div className="calendar-month-title">
          <b>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </b>
        </div>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={handleNextMonth}
          aria-label="Mes siguiente"
          title="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="client-calendar-weekdays" aria-hidden="true">
        {WEEKDAY_NAMES.map((name, i) => (
          <span key={name} className={i === 6 ? "sunday-col" : ""}>
            {name}
          </span>
        ))}
      </div>

      <div className="client-calendar-grid" role="grid" aria-label="Calendario de atención">
        {calendarDays.map((day) => {
          if (!day.isCurrentMonth) {
            return (
              <span key={day.dateStr} className="client-calendar-day muted" aria-hidden="true">
                {day.dayNumber}
              </span>
            );
          }

          return (
            <button
              key={day.dateStr}
              type="button"
              disabled={day.isDisabled}
              className={`client-calendar-day ${day.isSelected ? "selected" : ""} ${day.isDisabled ? "disabled" : "available"}`}
              onClick={() => onSelectDate(day.dateStr)}
              aria-label={`${day.dayNumber} de ${MONTH_NAMES[currentMonth]}`}
              aria-selected={day.isSelected}
            >
              <span className="day-number">{day.dayNumber}</span>
              {day.isSelected && <span className="day-selected-dot" />}
            </button>
          );
        })}
      </div>

      <div className="client-calendar-legend">
        <div className="legend-item">
          <span className="legend-dot available" />
          <small>Días con atención</small>
        </div>
        <div className="legend-item">
          <span className="legend-dot selected" />
          <small>Día seleccionado</small>
        </div>
        <div className="legend-item">
          <span className="legend-dot disabled" />
          <small>Domingos y cerrados</small>
        </div>
      </div>
    </div>
  );
}
