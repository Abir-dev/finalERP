import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { AddEventModal } from "@/components/modals/AddEventModal";
import { useToast } from "@/components/ui/use-toast";

interface CalendarEvent {
  name: string;
  type: string;
  time: string;
  description: string;
}

interface CalendarDay {
  day: number;
  current: boolean;
  events: CalendarEvent[];
}

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const { toast } = useToast();
  
  // Function to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const daysArray: CalendarDay[] = Array.from({length: firstDay}, (_, i) => ({
      day: new Date(year, month, -i).getDate(),
      current: false,
      events: []
    }));
    
    for (let i = 1; i <= days; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      daysArray.push({
        day: i,
        current: true,
        events: events[dateKey] || []
      });
    }
    
    return daysArray;
  };
  
  const handleAddEvent = (eventDetails: {
    name: string;
    type: string;
    date: string;
    time: string;
    description: string;
  }) => {
    const newEvent = {
      name: eventDetails.name,
      type: eventDetails.type,
      time: eventDetails.time,
      description: eventDetails.description
    };

    setEvents(prev => ({
      ...prev,
      [eventDetails.date]: [...(prev[eventDetails.date] || []), newEvent]
    }));

    toast({
      title: "Event Added",
      description: `${eventDetails.name} has been added to your calendar.`,
    });
  };
  
  const days = getDaysInMonth(currentMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage events, deadlines, and meetings</p>
        </div>
        <Button onClick={() => setShowAddEventModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Manage your schedule and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div key={day} className="text-center font-medium p-2 text-sm">
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div 
                key={index}
                className={`
                  p-2 min-h-[100px] border text-sm
                  ${day.current ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                  ${new Date().getDate() === day.day && 
                    new Date().getMonth() === currentMonth.getMonth() && 
                    new Date().getFullYear() === currentMonth.getFullYear() && 
                    day.current ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className="font-medium">{day.day}</div>
                {day.events.map((event, i) => (
                  <div 
                    key={i} 
                    className={`
                      mt-1 p-1 text-xs rounded truncate
                      ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                      ${event.type === 'deadline' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                      ${event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                    `}
                    title={`${event.name} - ${event.time}${event.description ? ` - ${event.description}` : ''}`}
                  >
                    {event.name} - {event.time}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddEventModal 
        open={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onAdd={handleAddEvent}
      />
    </div>
  );
};

export default Calendar;
