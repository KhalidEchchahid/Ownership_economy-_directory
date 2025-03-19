import Link from "next/link";
import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block gradient-heading">
              OE Directory
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Home
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              About
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              Resources
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="px-2 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="block px-2 py-1 text-lg">
                    Home
                  </Link>
                  <Link
                    href="#"
                    className="block px-2 py-1 text-lg text-muted-foreground"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="block px-2 py-1 text-lg text-muted-foreground"
                  >
                    Resources
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
