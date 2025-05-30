import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useAuth } from "@/app/context/auth-context";
import useSessionToken from "../hooks/use-session-token";

export const SessionManager: React.FC = () => {
  const { user, logout, sessionLogin, logoutAll } = useAuth();
  const {
    getStoredSessionToken,
    createExtendedToken,
    logoutSession,
    logoutAllSessions,
    isSessionValid,
  } = useSessionToken();

  const [durationDays, setDurationDays] = useState<number>(30);
  const [extendedTokenInfo, setExtendedTokenInfo] = useState<string>("");
  const [sessionValidationResult, setSessionValidationResult] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateExtendedToken = async () => {
    setIsLoading(true);
    try {
      const result = await createExtendedToken(durationDays);
      setExtendedTokenInfo(
        `Token criado: ${result.sessionToken.substring(
          0,
          20
        )}... (${durationDays} dias)`
      );
    } catch (error) {
      setExtendedTokenInfo("Erro ao criar token estendido");
      console.error("Erro ao criar token estendido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateSession = async () => {
    setIsLoading(true);
    try {
      const isValid = await isSessionValid();
      setSessionValidationResult(isValid);
    } catch (error) {
      setSessionValidationResult(false);
      console.error("Erro ao validar sessão:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutCurrentSession = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout da sessão atual:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    setIsLoading(true);
    try {
      await logoutAll();
    } catch (error) {
      console.error("Erro ao fazer logout de todas as sessões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Gerenciador de Sessões</CardTitle>
          <CardDescription>
            Você precisa estar logado para gerenciar suas sessões.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentSessionToken = getStoredSessionToken();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Gerenciador de Sessões</CardTitle>
        <CardDescription>
          Gerencie seus tokens de sessão e configurações de autenticação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações da Sessão Atual */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Sessão Atual</h3>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p>
              <strong>Usuário:</strong> {user.name} ({user.email})
            </p>
            <p>
              <strong>Token:</strong>{" "}
              {currentSessionToken
                ? `${currentSessionToken.substring(0, 20)}...`
                : "Não encontrado"}
            </p>
          </div>
        </div>

        {/* Validar Sessão */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Validar Sessão</h3>
          <div className="flex gap-2 items-center">
            <Button onClick={handleValidateSession} disabled={isLoading}>
              {isLoading ? "Validando..." : "Validar Sessão Atual"}
            </Button>
            {sessionValidationResult !== null && (
              <span
                className={`text-sm ${
                  sessionValidationResult ? "text-green-600" : "text-red-600"
                }`}
              >
                {sessionValidationResult
                  ? "✅ Sessão válida"
                  : "❌ Sessão inválida"}
              </span>
            )}
          </div>
        </div>

        {/* Criar Token Estendido */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Criar Token Estendido</h3>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="duration">Duração (dias)</Label>
              <Input
                id="duration"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            <Button onClick={handleCreateExtendedToken} disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Token"}
            </Button>
          </div>
          {extendedTokenInfo && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {extendedTokenInfo}
            </p>
          )}
        </div>

        {/* Logout Options */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Opções de Logout</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLogoutCurrentSession}
              disabled={isLoading}
            >
              {isLoading ? "Saindo..." : "Logout da Sessão Atual"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutAllSessions}
              disabled={isLoading}
            >
              {isLoading ? "Saindo..." : "Logout de Todas as Sessões"}
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            O logout de todas as sessões irá desconectar você de todos os
            dispositivos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManager;
