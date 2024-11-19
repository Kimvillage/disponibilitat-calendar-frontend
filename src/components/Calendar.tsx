'use client';

import React, { useState, useEffect } from 'react';

const DAYS_OF_WEEK = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const MONTHS = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];

type Status = 'none' | 'morning' | 'afternoon' | 'full_day' | 'bolo';

interface DayData {
  status: Status;
}

const API_URL = 'https://quimvila.com/calendari/api';

export default function Calendar() {
  const [calendar, setCalendar] = useState<Record<string, DayData>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dades
  const fetchCalendarData = async () => {
    try {
      const response = await fetch(`${API_URL}/calendar`);
      if (!response.ok) throw new Error('Error carregant dades');
      const data = await response.json();
      setCalendar(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Error carregant les dades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dades inicialment
  useEffect(() => {
    fetchCalendarData();
    const interval = setInterval(fetchCalendarData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Canviar estat d'un dia
  const handleDayClick = async (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    const currentStatus = calendar[formattedDate]?.status || 'none';
    const statusOrder: Status[] = ['none', 'morning', 'afternoon', 'full_day', 'bolo'];
    const currentIndex = statusOrder.indexOf(currentStatus as Status);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    const newCalendar = {
      ...calendar,
      [formattedDate]: { status: newStatus }
    };

    try {
      const response = await fetch(`${API_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCalendar)
      });

      if (!response.ok) throw new Error('Error desant els canvis');

      setCalendar(newCalendar);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Error desant els canvis');
      console.error(err);
      await fetchCalendarData();
    }
  };

  // Obtenir color segons estat
  const getDayColor = (dayData?: DayData) => {
    switch(dayData?.status) {
      case 'morning':
        return 'bg-gradient-to-r from-blue-500 from-50% via-transparent via-50% to-transparent text-black';
      case 'afternoon':
        return 'bg-gradient-to-r from-transparent from-50% via-transparent via-50% to-yellow-500 text-black';
      case 'full_day':
        return 'bg-green-500 text-white';
      case 'bolo':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-100 hover:bg-gray-200';
    }
  };

  // Obtenir dies del mes
  const getDays = () => {
    const days = [];
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const dayIndex = (startDate.getDay() + 6) % 7;

    for (let i = 0; i < dayIndex; i++) {
      days.push({ date: null });
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const formattedDate = d.toISOString().split('T')[0];
      days.push({
        date: new Date(d),
        dayData: calendar[formattedDate] || { status: 'none' }
      });
    }

    return days;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="space-y-4">
          <div className="h-8 w-64 mx-auto bg-gray-200 animate-pulse rounded"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array(35).fill(0).map((_, i) => (
              <div key={i} className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-lg text-gray-600 mb-2">
            Calendari de Disponibilitat
          </h1>
          <h2 className="text-3xl font-bold text-gray-800">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualització: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button 
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors" 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            Anterior
          </button>
          <button 
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            Següent
          </button>
        </div>

        <div className="text-sm mb-6 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500 text-white">Matí</span>
          <span className="px-3 py-1 rounded-full bg-yellow-500 text-white">Tarda</span>
          <span className="px-3 py-1 rounded-full bg-green-500 text-white">Tot el dia</span>
          <span className="px-3 py-1 rounded-full bg-red-500 text-white">Bolo</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="font-medium text-center text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}
          {getDays().map(({ date, dayData }, index) => (
            <div
              key={index}
              className={`
                p-2 border rounded-md cursor-pointer text-center 
                transition-colors duration-200 
                ${date ? getDayColor(dayData) : 'bg-gray-50'}
                ${date ? 'hover:opacity-80' : ''}
              `}
              onClick={() => date && handleDayClick(date)}
            >
              {date?.getDate() || ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
