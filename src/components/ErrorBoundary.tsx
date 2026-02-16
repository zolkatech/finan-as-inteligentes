import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center gap-3 text-destructive mb-4">
                            <AlertTriangle className="h-6 w-6" />
                            <h2 className="text-lg font-semibold">Algo deu errado</h2>
                        </div>

                        <p className="text-muted-foreground mb-4 text-sm">
                            Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
                        </p>

                        {this.state.error && (
                            <div className="bg-muted/50 p-3 rounded-md mb-6 overflow-auto max-h-40">
                                <code className="text-xs font-mono text-foreground/80 break-words">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                            variant="default"
                        >
                            Recarregar Página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
