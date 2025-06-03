import Link from "next/link";
import { ArrowRight, Music, List, Users, Search, Play } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg mb-8">
            <Music className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent mb-6 leading-tight">
            Rise Worship
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            A plataforma perfeita para{" "}
            <span className="text-orange-600 dark:text-orange-400 font-semibold">
              organizar
            </span>{" "}
            suas músicas e{" "}
            <span className="text-orange-600 dark:text-orange-400 font-semibold">
              colaborar
            </span>{" "}
            com sua equipe de louvor
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/register">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-semibold px-8 py-3 rounded-xl"
            >
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>

          {/* Mini preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Music className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Biblioteca Musical
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Organize todas as suas músicas com cifras e letras
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <List className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Setlists Inteligentes
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Crie escalas de forma rápida e intuitiva
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Colaboração
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Compartilhe e colabore com sua equipe
              </p>
            </div>
          </div>
        </div>
      </section>{" "}
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Ferramentas pensadas especialmente para músicos e líderes de
              louvor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-950/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Busca Inteligente
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Encontre qualquer música rapidamente por título, artista ou
                  trecho da letra
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-950/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Transposição Automática
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Mude o tom das suas músicas instantaneamente para qualquer
                  tonalidade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-950/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <List className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Setlists Personalizadas
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Crie escalas musicais organizadas e compartilhe com sua equipe
                  em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-950/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Gestão de Equipes
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Organize múltiplas equipes e colabore de forma eficiente com
                  todos os membros
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>{" "}
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para transformar seu ministério?
            </h2>
            <p className="text-xl text-orange-100 mb-10">
              Junte-se a centenas de equipes que já organizam melhor seus
              momentos de louvor
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              <Link href="/register">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 bg-slate-900 dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Rise Worship</span>
            </div>
            <div className="text-slate-400">
              © {new Date().getFullYear()} Rise Worship. Todos os direitos
              reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
