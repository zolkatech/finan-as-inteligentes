import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Menu, LayoutDashboard, ChevronLeft, User, LogOut, Sun, Moon, Laptop, Calendar as CalendarIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

interface LeftWidgetProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

export const LeftWidget = ({ isExpanded, toggleSidebar }: LeftWidgetProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setTheme } = useTheme();
    const [userName, setUserName] = useState("Usuário");
    const [userEmail, setUserEmail] = useState("");


    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();

                if (profile) {
                    if (profile.full_name) setUserName(profile.full_name);
                } else if (user.user_metadata?.full_name) {
                    setUserName(user.user_metadata.full_name);
                } else {
                    setUserName(user.email?.split('@')[0] || "Usuário");
                }
                setUserEmail(user.email || "");
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    const isActive = (path: string) => location.pathname === path;

    // Animation variants
    const sidebarVariants = {
        expanded: { width: "240px" },
        collapsed: { width: "80px" },
    };

    const navItems = [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/agenda", label: "Agenda", icon: CalendarIcon },
    ];

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile?.role === 'admin') {
                    setIsAdmin(true);
                }
            }
        };
        checkAdmin();
    }, []);

    if (isAdmin) {
        // Prevent duplicate if re-rendering
        if (!navItems.find(i => i.path === '/admin')) {
            navItems.push({ path: "/admin", label: "Admin", icon: Shield });
        }
    }

    return (
        <motion.div
            className={cn(
                "fixed left-6 top-6 bottom-6 z-50 flex flex-col",
                // remove items-center to allow full width usage
            )}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="h-full bg-card rounded-2xl shadow-sm border border-border p-4 flex flex-col gap-4 overflow-hidden">

                {/* Toggle Button / Header */}
                <div className={cn("flex items-center", isExpanded ? "justify-between px-2" : "justify-center")}>
                    {isExpanded && <span className="font-bold text-lg whitespace-nowrap">Menu</span>}
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
                        {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 mt-4 flex-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;

                        return (
                            <Button
                                key={item.path}
                                variant={active ? "secondary" : "ghost"}
                                className={cn(
                                    "justify-start gap-3 h-12 overflow-hidden",
                                    !isExpanded && "justify-center px-0"
                                )}
                                onClick={() => navigate(item.path)}
                                title={!isExpanded ? item.label : undefined}
                            >
                                <div className={cn("p-2 rounded-lg shrink-0", active ? "bg-primary/10" : "")}>
                                    <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Button>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-2">
                    <Button
                        variant={isActive("/integrations") ? "secondary" : "ghost"}
                        className={cn(
                            "justify-start gap-3 h-12 overflow-hidden",
                            !isExpanded && "justify-center px-0"
                        )}
                        onClick={() => navigate("/integrations")}
                        title={!isExpanded ? "Integrações" : undefined}
                    >
                        <div className={cn("p-2 rounded-lg shrink-0", isActive("/integrations") ? "bg-primary/10" : "")}>
                            <Laptop className={cn("h-5 w-5", isActive("/integrations") ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="whitespace-nowrap"
                            >
                                Integrações
                            </motion.span>
                        )}
                    </Button>

                    <div className="border-t border-border pt-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={cn("w-full h-auto p-2", isExpanded ? "justify-start px-2" : "justify-center px-0")}>
                                    <Avatar className="h-9 w-9 border border-border shrink-0">
                                        <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-start ml-3 overflow-hidden text-left"
                                        >
                                            <span className="text-sm font-medium truncate w-full">{userName}</span>
                                            <span className="text-xs text-muted-foreground truncate w-full">{userEmail}</span>
                                        </motion.div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="right" className="w-56 ml-2">
                                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Tema</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Claro</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    <Moon className="mr-2 h-4 w-4" />
                                    <span>Escuro</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    <Laptop className="mr-2 h-4 w-4" />
                                    <span>Sistema</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sair</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
