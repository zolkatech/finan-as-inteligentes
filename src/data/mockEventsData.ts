export interface MockCalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    color?: string;
}

// Helper to create dates for "today" with specific times
const getTodayAt = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const todayEvents: MockCalendarEvent[] = [
    {
        id: "1",
        title: "Reunião de Planejamento",
        start: getTodayAt(10, 0),
        end: getTodayAt(11, 30),
        color: "#3b82f6", // blue
    },
    {
        id: "2",
        title: "Almoço com Cliente",
        start: getTodayAt(12, 30),
        end: getTodayAt(14, 0),
        color: "#10b981", // green
    },
    {
        id: "3",
        title: "Revisão de Metas",
        start: getTodayAt(15, 0),
        end: getTodayAt(16, 0),
        color: "#f59e0b", // yellow
    },
    {
        id: "4",
        title: "Call com Fornecedor",
        start: getTodayAt(16, 30),
        end: getTodayAt(17, 0),
        color: "#8b5cf6", // purple
    }
];
