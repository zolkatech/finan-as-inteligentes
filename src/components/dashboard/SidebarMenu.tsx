import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Target, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";

interface SidebarMenuProps {
    className?: string;
}

export function SidebarMenu({ className }: SidebarMenuProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={className}>
                    <Menu className="h-6 w-6 text-muted-foreground" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="text-left mb-6">
                    <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2">
                    <SheetClose asChild>
                        <Button
                            variant={isActive("/") ? "secondary" : "ghost"}
                            className="justify-start gap-4 text-sm font-medium hover:bg-secondary/50 h-12 w-full"
                            onClick={() => navigate("/")}
                        >
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                            </div>
                            Dashboard
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button
                            variant={isActive("/metas") ? "secondary" : "ghost"}
                            className="justify-start gap-4 text-sm font-medium hover:bg-secondary/50 h-12 w-full"
                            onClick={() => navigate("/metas")}
                        >
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Target className="h-5 w-5 text-primary" />
                            </div>
                            Metas
                        </Button>
                    </SheetClose>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
