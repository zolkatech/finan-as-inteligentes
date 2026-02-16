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
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    desc?: string;
    color?: string;
}

interface EventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: CalendarEvent) => void;
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
        } else if (selectedSlot) {
            setTitle("");
            setDesc("");
            setStart(formatDateTime(selectedSlot.start));
            setEnd(formatDateTime(selectedSlot.end));
            setColor("#3b82f6");
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
        };

        onSave(newEvent);
        onClose();
    };

    const handleDelete = () => {
        if (selectedEvent) {
            onDelete(selectedEvent.id);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes do seu compromisso abaixo.
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
                            />
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <Label htmlFor="desc">
                            Descrição
                        </Label>
                        <Textarea
                            id="desc"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter className={selectedEvent ? "sm:justify-between" : "sm:justify-end"}>
                    {selectedEvent && (
                        <Button variant="destructive" size="icon" onClick={handleDelete} type="button">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
