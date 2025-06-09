"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="container mx-auto max-w-md">
        <Card className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-orange-100 dark:border-orange-900/30">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                404
              </span>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent">
              Página não encontrada
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 text-base mt-2">
              A página que você está procurando não existe ou foi movida.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="default"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                asChild
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Voltar ao Início
                </Link>
              </Button>

              <Button
                variant="outline"
                className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
              Se você acredita que isso é um erro, entre em contato conosco.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
