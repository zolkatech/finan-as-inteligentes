import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Trash2, Calendar as CalendarIcon } from "lucide-react";

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    desc?: string;
    color?: string;
    isGoogleEvent?: boolean;
}

interface EventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: CalendarEvent, addToGoogle?: boolean) => void;
    onDelete: (id: string) => void;
    selectedEvent: CalendarEvent | null;
    selectedSlot: { start: Date; end: Date } | null;
}

export function EventDialog({
    isOpen,
    onClose,
    onSave,
    onDelete,
    selectedEvent,
    selectedSlot,
}: EventDialogProps) {
    const [color, setColor] = useState("#3b82f6");
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [addToGoogle, setAddToGoogle] = useState(true); // Default to true as requested

    const colors = [
        "#3b82f6", // Blue
        "#10b981", // Green
        "#f59e0b", // Yellow
        "#ef4444", // Red
        "#8b5cf6", // Purple
        "#ec4899", // Pink
        "#6366f1", // Indigo
        "#6b7280", // Gray
    ];

    useEffect(() => {
        if (selectedEvent) {
            setTitle(selectedEvent.title);
            setDesc(selectedEvent.desc || "");
            setStart(formatDateTime(selectedEvent.start));
            setEnd(formatDateTime(selectedEvent.end));
            setColor(selectedEvent.color || "#3b82f6");
            setAddToGoogle(false); // Default to false when editing for now or check if it's linked
        } else if (selectedSlot) {
            setTitle("");
            setDesc("");
            setStart(formatDateTime(selectedSlot.start));
            setEnd(formatDateTime(selectedSlot.end));
            setColor("#3b82f6");
            setAddToGoogle(true); // Default to true for new events
        }
    }, [selectedEvent, selectedSlot, isOpen]);

    const formatDateTime = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const handleSave = () => {
        if (!title || !start || !end) return;

        const newEvent: CalendarEvent = {
            id: selectedEvent?.id || Math.random().toString(36).substr(2, 9),
            title,
            desc,
            start: new Date(start),
            end: new Date(end),
            color,
            isGoogleEvent: selectedEvent?.isGoogleEvent
        };

        onSave(newEvent, addToGoogle);
        onClose();
    };

    const handleDelete = () => {
        if (selectedEvent) {
            onDelete(selectedEvent.id);
            onClose();
        }
    };

    const isGoogleEvent = selectedEvent?.isGoogleEvent;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
                    <DialogDescription>
                        {isGoogleEvent
                            ? "Este evento é do Google Calendar e não pode ser editado aqui."
                            : "Preencha os detalhes do seu compromisso abaixo."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Título
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full"
                            disabled={isGoogleEvent}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start">
                                Início
                            </Label>
                            <Input
                                id="start"
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full"
                                disabled={isGoogleEvent}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end">
                                Fim
                            </Label>
                            <Input
                                id="end"
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full"
                                disabled={isGoogleEvent}
                            />
                        </div>
                    </div>

                    {!isGoogleEvent && (
                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`w-6 h-6 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="desc">
                            Descrição
                        </Label>
                        <Textarea
                            id="desc"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full min-h-[100px]"
                            disabled={isGoogleEvent}
                        />
                    </div>

                    {!selectedEvent && !isGoogleEvent && (
                        <div className="flex items-center space-x-2 pt-2 border-t mt-2">
                            <Switch
                                id="google-sync"
                                checked={addToGoogle}
                                onCheckedChange={setAddToGoogle}
                            />
                            <Label htmlFor="google-sync" className="flex items-center gap-2 cursor-pointer">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                Adicionar também ao Google Calendar
                            </Label>
                        </div>
                    )}
                </div>
                <DialogFooter className={selectedEvent ? "sm:justify-between" : "sm:justify-end"}>
                    {selectedEvent && !isGoogleEvent && (
                        <Button variant="destructive" size="icon" onClick={handleDelete} type="button">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            {isGoogleEvent ? "Fechar" : "Cancelar"}
                        </Button>
                        {!isGoogleEvent && <Button onClick={handleSave}>Salvar</Button>}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
