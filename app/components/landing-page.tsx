import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle, Music, Users } from "lucide-react";
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-orange-50 to-white">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
            aria-hidden="true"
          >
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-orange-200 to-orange-400 opacity-30"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-6">
            <Music className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Simplify Your Worship Team Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Rise Worship helps you organize your songs, create setlists, and
            collaborate with your team members - all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything Your Worship Team Needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for worship leaders and teams to streamline
              organization and enhance collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-orange-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                  <Music className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Song Management</CardTitle>
                <CardDescription>
                  Organize your songs with lyrics, chords, and key information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Store lyrics and chords",
                    "Transpose songs to any key",
                    "Add notes for team members",
                    "Search by title or lyrics",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Setlist Builder</CardTitle>
                <CardDescription>
                  Create and share setlists for your worship services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Drag-and-drop interface",
                    "Share with your team",
                    "Export to PDF",
                    "Track song usage history",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-100">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Collaborate with your team members seamlessly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Assign roles to members",
                    "Share notes and feedback",
                    "Manage multiple groups",
                    "Real-time updates",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by Worship Teams</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of worship teams already using Rise Worship to
              streamline their ministry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Rise Worship has transformed how our team prepares for Sunday services. Everything is organized and accessible.",
                author: "Michael Johnson",
                role: "Worship Leader, Grace Community Church",
              },
              {
                quote:
                  "The ability to quickly create and share setlists with our team has saved us hours of preparation time each week.",
                author: "Sarah Williams",
                role: "Music Director, Hillside Chapel",
              },
              {
                quote:
                  "As someone who leads multiple worship teams, having all our songs and setlists in one place is invaluable.",
                author: "David Chen",
                role: "Worship Pastor, New Life Fellowship",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-6">
                  <p className="mb-6 italic">{`"${testimonial.quote}"`}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Elevate Your Worship Ministry?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Join Rise Worship today and experience the difference organization
            and collaboration can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Music className="h-6 w-6 text-orange-500 mr-2" />
              <span className="font-bold">Rise Worship</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Rise Worship. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
