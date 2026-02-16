
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

export const ForcePasswordChangeDialog = () => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const checkRequirement = async () => {
            console.log("Checking password change requirement...");
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log("User found:", user.id);
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('must_change_password')
                    .eq('id', user.id)
                    .maybeSingle(); // Changed from .single() to prevent 406 errors

                if (error) console.error("Error fetching profile:", error);

                if (!profile) {
                    console.warn("Profile not found or access denied for ID:", user.id);
                } else {
                    console.log("Profile data:", profile);
                }

                if (profile?.must_change_password) {
                    console.log("Opening dialog...");
                    setOpen(true);
                }
            }
        };
        checkRequirement();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem.",
                variant: "destructive"
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Erro",
                description: "A senha deve ter no mínimo 6 caracteres.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.password
            });

            if (error) throw error;

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ must_change_password: false })
                    .eq('id', user.id);

                if (updateError) throw updateError;
            }

            toast({
                title: "Sucesso!",
                description: "Senha alterada com sucesso.",
            });
            setOpen(false);

        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message || "Erro ao alterar senha.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Troca de Senha Obrigatória
                    </DialogTitle>
                    <DialogDescription>
                        Por motivos de segurança, você deve definir uma nova senha para continuar acessando o sistema.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Salvando..." : "Definir Nova Senha"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
