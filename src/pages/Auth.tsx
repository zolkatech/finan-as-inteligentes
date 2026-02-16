
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Schemas
const loginSchema = z.object({
    identifier: z.string().min(3, "Email ou Telefone inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;


const Auth = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Forms
    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    // Handlers
    const onLogin = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            let emailToUse = data.identifier;

            // Check if identifier is phone number (simple check: contains mostly digits)
            const isPhone = /^[0-9+\-\s()]+$/.test(data.identifier);

            if (isPhone) {
                // Find email by phone in profiles
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('phone', data.identifier) // Ideally normalize phone numbers
                    .single();

                if (profileError || !profiles) {
                    throw new Error("Telefone não encontrado. Verifique ou use o email.");
                }
                emailToUse = profiles.email;
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: data.password,
            });

            if (error) throw error;

            toast.success("Login realizado com sucesso!");
            navigate("/");
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error.message || "Erro ao fazer login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <Card className="w-full max-w-md border-border/50 shadow-xl bg-card/50 backdrop-blur-sm relative z-10">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
                    <CardDescription>
                        Entre com seus dados para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="identifier">Email ou Telefone</Label>
                            <Input
                                id="identifier"
                                placeholder="seu@email.com ou (11) 99999-9999"
                                {...loginForm.register("identifier")}
                            />
                            {loginForm.formState.errors.identifier && (
                                <p className="text-sm text-destructive">{loginForm.formState.errors.identifier.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <a href="#" className="text-sm text-primary hover:underline">Esqueceu a senha?</a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                {...loginForm.register("password")}
                            />
                            {loginForm.formState.errors.password && (
                                <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                        Ao continuar, você concorda com nossos <a href="#" className="underline hover:text-primary">Termos de Serviço</a> e <a href="#" className="underline hover:text-primary">Política de Privacidade</a>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Auth;
