import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronLeft, ChevronRight, Clock, Grid, List } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Custom styles for the calendar
const calendarStyles = `
  .rbc-calendar {
    font-family: inherit;
  }
  .rbc-header {
    border-bottom: 1px solid #E5E8EC;
    padding: 12px 8px;
    font-weight: 600;
    color: #050F1C;
  }
  .rbc-today {
    background-color: #F0F9FF;
  }
  .rbc-off-range-bg {
    background-color: #F7F8FA;
  }
  .rbc-event {
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
  }
  .rbc-event-content {
    font-weight: 500;
  }
  .rbc-time-slot {
    border-top: 1px solid #E5E8EC;
  }
  .rbc-time-header-content {
    border-left: 1px solid #E5E8EC;
  }
  .rbc-day-slot .rbc-time-slot {
    border-top: 1px solid #E5E8EC;
  }
  .rbc-time-content {
    border-top: 2px solid #E5E8EC;
  }
  .rbc-toolbar {
    display: none; /* Hide default toolbar, using custom one */
  }
`;

// Inject styles
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const existingStyle = document.head.querySelector('style[data-calendar-styles]');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = calendarStyles;
    styleSheet.setAttribute('data-calendar-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

const localizer = momentLocalizer(moment);

// Custom timeline view (using week view as base for timeline display)
const TimelineView = {
  ...Views.WEEK,
  name: 'Timeline',
  range: Views.WEEK.range
};

const CauseListCalendar = ({ events, onEventDrop, onEventClick, onEventEdit, onEventDelete, onNavigate, currentDate }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(currentDate || new Date());
  
  // Define custom views
  const views = {
    month: Views.MONTH,
    week: Views.WEEK,
    day: Views.DAY,
    timeline: TimelineView
  };

  // Debug: Log when component renders
  useEffect(() => {
    console.log('CauseListCalendar rendered with events:', events?.length || 0);
  }, [events]);

  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      const startDate = event.rawData?.hearing_date 
        ? new Date(event.rawData.hearing_date) 
        : new Date(event.hearingDate);
      
      // Parse time if available
      let startTime = startDate;
      if (event.rawData?.hearing_time) {
        const timeStr = event.rawData.hearing_time;
        const [hours, minutes] = timeStr.includes(':') 
          ? timeStr.split(':').map(Number)
          : [9, 0];
        startTime = new Date(startDate);
        startTime.setHours(hours, minutes || 0, 0, 0);
      } else if (event.hearingTime) {
        // Try to parse formatted time like "9:00 AM"
        const timeMatch = event.hearingTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const ampm = timeMatch[3].toUpperCase();
          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          startTime = new Date(startDate);
          startTime.setHours(hours, minutes, 0, 0);
        }
      }
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // Default 1 hour duration
      
      return {
        id: event.id,
        title: event.title || event.caseNo || 'Untitled Case',
        start: startTime,
        end: endTime,
        resource: event
      };
    });
  }, [events]);

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
    if (onNavigate) {
      onNavigate(newDate);
    }
  }, [onNavigate]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    if (onEventClick) {
      onEventClick(event.resource);
    }
  }, [onEventClick]);

  const handleEventDrop = useCallback(({ event, start, end }) => {
    if (onEventDrop) {
      // Update the event's hearing_date and hearing_time
      const newDate = moment(start).format('YYYY-MM-DD');
      // Send time in HH:MM format (24-hour) for backend compatibility
      const newTime = moment(start).format('HH:mm');
      
      onEventDrop(event.resource, {
        hearing_date: newDate,
        hearing_time: newTime  // Send as "HH:MM" string
      });
    }
  }, [onEventDrop]);

  const eventStyleGetter = (event) => {
    const status = event.resource?.rawData?.status || event.resource?.status || 'Active';
    let backgroundColor = '#022658'; // Default blue
    
    if (status === 'Closed') {
      backgroundColor = '#10B981'; // Green
    } else if (status === 'Adjourned') {
      backgroundColor = '#F59E0B'; // Orange
    } else if (status === 'Active') {
      backgroundColor = '#3B82F6'; // Blue
    }
    
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        padding: '2px 4px',
        fontSize: '12px'
      }
    };
  };

  const CustomEvent = ({ event }) => {
    return (
      <div className="flex flex-col">
        <div className="font-semibold text-xs truncate">{event.title}</div>
        {event.resource?.judgeName && event.resource.judgeName !== 'N/A' && (
          <div className="text-[10px] opacity-90 truncate">{event.resource.judgeName}</div>
        )}
        {event.resource?.hearingTime && (
          <div className="text-[10px] opacity-90">{event.resource.hearingTime}</div>
        )}
      </div>
    );
  };

  // Always render, even with no events
  // if (!events || events.length === 0) {
  //   return (
  //     <div className="w-full bg-white rounded-lg border border-[#E5E8EC] p-8 text-center">
  //       <p className="text-[#525866]">No events to display</p>
  //     </div>
  //   );
  // }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full bg-white rounded-lg border border-[#E5E8EC]">
        {/* Calendar Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E8EC]">
          <div className="flex items-center gap-4">
            {/* View Buttons */}
            <div className="flex items-center gap-2 bg-[#F7F8FA] rounded-lg p-1 border border-[#D4E1EA]">
              <button
                onClick={() => handleViewChange(views.timeline)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  view === views.timeline
                    ? 'bg-[#022658] text-white'
                    : 'text-[#525866] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <List className="w-4 h-4" />
                  <span>Timeline</span>
                </div>
              </button>
              <button
                onClick={() => handleViewChange(views.day)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  view === views.day
                    ? 'bg-[#022658] text-white'
                    : 'text-[#525866] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Day</span>
                </div>
              </button>
              <button
                onClick={() => handleViewChange(views.month)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  view === views.month
                    ? 'bg-[#022658] text-white'
                    : 'text-[#525866] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Grid className="w-4 h-4" />
                  <span>Month</span>
                </div>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const unit = view === views.month ? 'month' : view === views.day ? 'day' : 'week';
                handleNavigate(moment(date).subtract(1, unit).toDate());
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#525866]" />
            </button>
            <button
              onClick={() => handleNavigate(new Date())}
              className="px-4 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] text-sm font-medium text-[#525866] hover:bg-gray-100"
            >
              Today
            </button>
            <button
              onClick={() => {
                const unit = view === views.month ? 'month' : view === views.day ? 'day' : 'week';
                handleNavigate(moment(date).add(1, unit).toDate());
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#525866]" />
            </button>
            <div className="text-lg font-semibold text-[#050F1C] min-w-[200px] text-center">
              {moment(date).format(view === views.month ? 'MMMM YYYY' : view === views.day ? 'MMMM DD, YYYY' : view === views.timeline ? 'MMMM DD, YYYY' : 'MMMM DD, YYYY')}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
          {calendarEvents && calendarEvents.length > 0 ? (
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              views={views}
              date={date}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              onSelectEvent={handleSelectEvent}
              onEventDrop={handleEventDrop}
              eventPropGetter={eventStyleGetter}
              components={{
                event: CustomEvent
              }}
              draggableAccessor={() => true}
              resizable={false}
              defaultView={views.month}
              popup
              showMultiDayTimes
              step={30}
              timeslots={2}
              min={new Date(2024, 0, 1, 8, 0)}
              max={new Date(2024, 0, 1, 18, 0)}
              style={{ height: '100%' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#525866]">No events to display. Add events to see them on the calendar.</p>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default CauseListCalendar;

