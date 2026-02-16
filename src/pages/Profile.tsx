
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";


const profileSchema = z.object({
    full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email().optional(), // Read only
    phone: z.string().optional(), // Read only
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);


    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
        },
    });

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    setUserId(user.id);
                    form.setValue("email", user.email || "");
                    form.setValue("phone", user.user_metadata?.phone || ""); // Phone might be in metadata or profiles

                    const { data, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    if (error && error.code !== "PGRST116") {
                        throw error;
                    }

                    if (data) {
                        form.setValue("full_name", data.full_name || "");
                        // If phone is in profiles, override
                        if (data.phone) form.setValue("phone", data.phone);
                        if (data.email) form.setValue("email", data.email);
                    }
                }
            } catch (error: any) {
                console.error("Error loading user:", error.message);
            }
        };

        getProfile();
    }, [form]);




    const onSubmit = async (data: ProfileFormValues) => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: userId,
                    full_name: data.full_name,
                    updated_at: new Date(),
                });

            if (error) throw error;
            toast.success("Perfil atualizado com sucesso!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar perfil");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-6">CONFIGURAÇÕES</h1>

                <div className="grid gap-6">
                    <Card className="max-w-2xl mx-auto w-full">
                        <CardHeader>
                            <CardTitle>Seu Perfil</CardTitle>
                            <CardDescription>
                                Gerencie suas informações pessoais e foto de perfil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>


                            {/* Form Section */}
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 w-full">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Nome Completo</Label>
                                    <Input id="full_name" {...form.register("full_name")} />
                                    {form.formState.errors.full_name && (
                                        <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" {...form.register("email")} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input id="phone" {...form.register("phone")} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">Para alterar o telefone, entre em contato com o suporte.</p>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
};

export default Profile;
