"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Briefcase, Users, TrendingUp, Search, FileText, CheckCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const studentsRef = useRef<HTMLElement>(null)
  const companiesRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)

    // Intersection Observer pour les animations au scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const sections = [heroRef, featuresRef, studentsRef, companiesRef, ctaRef]
    sections.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 sm:py-20 md:py-32 opacity-0 translate-y-10 transition-all duration-1000 ease-out overflow-hidden"
        >
          {/* Cercles décoratifs en arrière-plan */}
          <div className="absolute top-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
              <h1 
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text px-2"
                style={{
                  animation: mounted ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
                }}
              >
                Trouvez le stage parfait pour votre avenir
              </h1>
              <p 
                className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty px-2"
                style={{
                  animation: mounted ? 'fadeInUp 0.8s ease-out 0.4s both' : 'none'
                }}
              >
                EspaceStage connecte les étudiants talentueux avec les entreprises innovantes. Démarrez votre carrière
                professionnelle dès aujourd'hui.
              </p>
              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                style={{
                  animation: mounted ? 'fadeInUp 0.8s ease-out 0.6s both' : 'none'
                }}
              >
                <Button size="lg" asChild className="text-sm sm:text-base group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                  <Link href="/auth/register">
                    <span className="relative z-10">Commencer gratuitement</span>
                    <span className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-sm sm:text-base bg-background/50 backdrop-blur-sm group relative overflow-hidden border-2 hover:border-primary transition-all duration-300 w-full sm:w-auto">
                  <Link href="/auth/login">
                    <span className="relative z-10">Se connecter</span>
                    <span className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          className="py-12 sm:py-16 md:py-20 bg-muted/30 opacity-0 translate-y-10 transition-all duration-1000 ease-out" 
          id="a-propos"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                Fonctionnalités
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance px-2">Une plateforme complète pour tous</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty px-2">
                Que vous soyez étudiant ou entreprise, nous facilitons la connexion et la gestion des stages.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Search,
                  title: "Recherche simplifiée",
                  description: "Trouvez rapidement les offres de stage qui correspondent à votre profil et vos ambitions.",
                  delay: "0s"
                },
                {
                  icon: FileText,
                  title: "Gestion facilitée",
                  description: "Gérez vos candidatures et offres en un seul endroit avec des outils intuitifs.",
                  delay: "0.2s"
                },
                {
                  icon: CheckCircle,
                  title: "Matching intelligent",
                  description: "Notre algorithme vous propose les meilleures correspondances pour un stage réussi.",
                  delay: "0.4s"
                }
              ].map((feature, index) => (
                <Card 
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:-translate-y-2 bg-gradient-to-br from-background to-muted/30"
                  style={{
                    animation: mounted ? `fadeInUp 0.6s ease-out ${feature.delay} both` : 'none'
                  }}
                >
                  <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 text-center space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Students Section */}
        <section 
          ref={studentsRef}
          className="py-12 sm:py-16 md:py-20 opacity-0 -translate-x-10 transition-all duration-1000 ease-out" 
          id="etudiants"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold shadow-sm">
                  🎓 Pour les étudiants
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-balance">Lancez votre carrière avec le bon stage</h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Accédez à des centaines d'offres de stage dans tous les secteurs. Créez votre profil, postulez en un
                  clic et suivez vos candidatures en temps réel.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Profil professionnel personnalisé</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Alertes pour les nouvelles offres</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Suivi de candidatures simplifié</span>
                  </li>
                </ul>
                <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                  <Link href="/auth/register">Créer mon compte étudiant →</Link>
                </Button>
              </div>
              <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl overflow-hidden group shadow-xl">
                {/* Overlay avec animation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                
                {/* Cercles décoratifs animés */}
                <div className="absolute top-10 right-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-float"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float-delayed"></div>
                
                <img
                  src="/student-working-on-laptop-in-modern-office.jpg"
                  alt="Étudiant travaillant"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                />
                
                {/* Badge animé */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Rejoignez-nous !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Companies Section */}
        <section 
          ref={companiesRef}
          className="py-12 sm:py-16 md:py-20 bg-muted/30 opacity-0 translate-x-10 transition-all duration-1000 ease-out" 
          id="entreprises"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl overflow-hidden order-2 md:order-1 group shadow-xl">
                {/* Overlay avec animation */}
                <div className="absolute inset-0 bg-gradient-to-bl from-accent/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                
                {/* Cercles décoratifs animés */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-float"></div>
                <div className="absolute bottom-10 right-10 w-28 h-28 bg-primary/20 rounded-full blur-3xl animate-float-delayed"></div>
                
                <img
                  src="/business-team-meeting.png"
                  alt="Équipe d'entreprise"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:-rotate-2"
                />
                
                {/* Badge animé */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                  <p className="text-sm font-semibold text-accent flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Recrutez maintenant !
                  </p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6 order-1 md:order-2">
                <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-semibold shadow-sm">
                  🏬 Pour les entreprises
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-balance">Recrutez les talents de demain</h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Publiez vos offres de stage et accédez à un vivier de candidats qualifiés. Gérez vos recrutements
                  efficacement avec nos outils dédiés.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Publication d'offres illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Accès à des profils qualifiés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Tableau de bord analytique</span>
                  </li>
                </ul>
                <Button size="lg" variant="default" asChild className="shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                  <Link href="/auth/register">Créer mon compte entreprise →</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={ctaRef}
          className="py-12 sm:py-16 md:py-20 opacity-0 scale-95 transition-all duration-1000 ease-out"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-0 hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="py-12 sm:py-16 text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance px-2">Prêt à commencer votre aventure ?</h2>
                <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty px-2">
                  Rejoignez des milliers d'étudiants et d'entreprises qui font confiance à EspaceStage.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
                  <Button size="lg" variant="secondary" asChild className="text-sm sm:text-base w-full sm:w-auto">
                    <Link href="/auth/register">S'inscrire maintenant</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-sm sm:text-base bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                  >
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />

      {/* Styles d'animation */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Animation flottante pour les cercles décoratifs */
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-15px) translateX(5px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(15px) translateX(-10px);
          }
          50% {
            transform: translateY(10px) translateX(10px);
          }
          75% {
            transform: translateY(20px) translateX(-5px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) scale(1) !important;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}
