'use client';

import { useState, useEffect } from 'react';

const DAYS_OF_WEEK = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const MONTHS = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];

const STATUS = {
  NONE: 'none',
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  FULL_DAY: 'full_day',
  BOLO: 'bolo'
} as const;

export default function Calendar() {
  const [calendar, setCalendar] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dades del calendari
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      console.log('Carregant dades...');
      const response = await fetch('http://localhost:3001/api/calendar');
      
      if (!response.ok) throw new Error('Error carregant les dades');
      
      const data = await response.json();
      console.log('Dades rebudes:', data);
      setCalendar(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error carregant les dades');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dades inicialment
  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Canviar l'estat d'un dia
  const handleDayClick = async (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    const currentStatus = calendar[formattedDate]?.status || STATUS.NONE;
    
    const statusOrder = [STATUS.NONE, STATUS.MORNING, STATUS.AFTERNOON, STATUS.FULL_DAY, STATUS.BOLO];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    const newCalendar = {
      ...calendar,
      [formattedDate]: { status: newStatus }
    };

    try {
      const response = await fetch('http://localhost:3001/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCalendar)
      });

      if (!response.ok) throw new Error('Error desant els canvis');

      setCalendar(newCalendar);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error desant els canvis');
    }
  };

  const getDayColor = (dayData?: any) => {
    switch(dayData?.status) {
      case STATUS.MORNING:
        return 'bg-gradient-to-r from-blue-500 from-50% via-transparent via-50% to-transparent text-black';
      case STATUS.AFTERNOON:
        return 'bg-gradient-to-r from-transparent from-50% via-transparent via-50% to-yellow-500 text-black';
      case STATUS.FULL_DAY:
        return 'bg-green-500 text-white';
      case STATUS.BOLO:
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-100 hover:bg-gray-200';
    }
  };

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
        dayData: calendar[formattedDate] || { status: STATUS.NONE }
      });
    }

    return days;
  };

  if (loading) {
    return (
      <div className="text-center">Carregant calendari...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-6">
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
