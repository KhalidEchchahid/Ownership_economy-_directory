import { OrganizationDirectory } from "@/components/organization-directory";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-2 text-center gradient-heading">
          Ownership Economy Directory
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Explore organizations within the Ownership Economy including
          cooperatives, DAOs, employee-owned businesses, and more.
        </p>
        <OrganizationDirectory />
      </main>
      <footer className="border-t py-6 bg-muted/40">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ownership Economy Directory. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
