"use client";
import type { Organization } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  Wallet,
  Award,
  Tag,
  Clock,
  Landmark,
  Coins,
  Link,
  Twitter,
  Linkedin,
  Github,
  MessageSquare,
  PieChart,
  Share2,
  Info,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

const OrganizationDialogSkeleton = () => (
  <div className="p-6 space-y-8 animate-fade-in">
    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 bg-muted animate-pulse rounded-md mb-3"></div>
        <div className="h-20 bg-muted animate-pulse rounded-md"></div>
      </div>

      <div>
        <div className="h-7 w-40 bg-muted animate-pulse rounded-md mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="stat-card">
              <CardHeader className="p-4 pb-2">
                <div className="h-5 w-24 bg-muted animate-pulse rounded-md"></div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-6 w-full bg-muted animate-pulse rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>

    <div className="section-divider"></div>

    <div className="space-y-6">
      <div className="h-7 w-64 bg-muted animate-pulse rounded-md mb-3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/10 dark:to-transparent">
            <div className="h-6 w-48 bg-muted animate-pulse rounded-md"></div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-6 bg-muted animate-pulse rounded-md"
              ></div>
            ))}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/10 dark:to-transparent">
            <div className="h-6 w-48 bg-muted animate-pulse rounded-md"></div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-6 bg-muted animate-pulse rounded-md"
              ></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export function OrganizationDialog({
  organization,
  open,
  onOpenChange,
  loading,
}: OrganizationDialogProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get a color based on organization type
  const getTypeColor = (type: string) => {
    const typeMap = {
      Cooperative:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-100",
      DAO: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-100",
      "Employee-Owned":
        "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-100",
    };

    // Default to primary color if type not found
    return (
      typeMap[type as keyof typeof typeMap] ||
      "bg-primary/10 text-primary dark:bg-primary/20"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <DialogHeader className="p-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <DialogTitle className="text-2xl gradient-heading">
                  {organization.name}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 items-center mt-2">
                  <Badge
                    className={getTypeColor(organization.type_of_organization)}
                  >
                    {organization.type_of_organization}
                  </Badge>
                  {organization.year_founded && (
                    <span className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      Est. {organization.year_founded}
                    </span>
                  )}
                </DialogDescription>
              </div>

              {organization.links_social_media?.website && (
                <a
                  href={organization.links_social_media.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Visit Website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </DialogHeader>
        </div>

        {loading ? (
          <OrganizationDialogSkeleton />
        ) : (
          <div className="p-6 space-y-8 animate-fade-in">
            {/* Overview Section */}
            <div className="space-y-6">
              {organization.description && (
                <div>
                  <h3 className="section-heading">
                    <Info className="h-5 w-5" />
                    About
                  </h3>
                  <p className="text-muted-foreground">
                    {organization.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="section-heading">
                  <Building2 className="h-5 w-5" />
                  Key Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="stat-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-primary" />
                        Industry
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="font-medium">{organization.industry}</p>
                    </CardContent>
                  </Card>

                  {organization.geographical_scope && (
                    <Card className="stat-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-primary" />
                          Geographic Scope
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="font-medium">
                          {organization.geographical_scope}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {organization.size && (
                    <Card className="stat-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          Organization Size
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="font-medium">{organization.size}</p>
                      </CardContent>
                    </Card>
                  )}

                  {organization.legal_structure && (
                    <Card className="stat-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                          <Landmark className="h-4 w-4 text-primary" />
                          Legal Structure
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="font-medium">
                          {organization.legal_structure}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {Array.isArray(organization.ownership_structure) &&
                organization.ownership_structure.length > 0 && (
                  <div>
                    <h3 className="section-heading">
                      <Users className="h-5 w-5" />
                      Ownership Structure
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {organization.ownership_structure.map(
                        (structure, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1.5 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30 dark:text-primary-foreground"
                          >
                            {structure}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="section-divider"></div>

            {/* Financial & Token Information */}
            <div className="space-y-6">
              <h3 className="section-heading">
                <Coins className="h-5 w-5" />
                Financial & Token Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {organization.funding_financial_information?.revenue &&
                    organization.funding_financial_information.revenue !==
                      "Unknown" ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Revenue</span>
                          <span>
                            {organization.funding_financial_information.revenue}
                          </span>
                        </div>
                        <Progress value={75} className="h-2 bg-primary/20" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="font-medium">Revenue</span>
                        <span>Not available</span>
                      </div>
                    )}

                    {Array.isArray(
                      organization.funding_financial_information
                        ?.funding_sources
                    ) &&
                    organization.funding_financial_information.funding_sources
                      .length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="font-medium">Funding Sources</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {organization.funding_financial_information.funding_sources.map(
                            (source, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-primary/20 dark:border-primary/30"
                              >
                                {source}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="font-medium">Funding Sources</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          No funding sources available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {organization.token_information && (
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/30 dark:to-transparent">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Coins className="h-5 w-5 text-accent" />
                        Token Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {organization.token_information.token_name && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Token Name</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {organization.token_information.token_name}
                            </span>
                            {organization.token_information.token_symbol && (
                              <Badge
                                variant="outline"
                                className="bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:border-accent/30 dark:text-accent-foreground"
                              >
                                {organization.token_information.token_symbol}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {organization.token_information.blockchain_platform && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Blockchain Platform
                          </span>
                          <span>
                            {organization.token_information.blockchain_platform}
                          </span>
                        </div>
                      )}

                      <Separator />

                      {organization.token_information.governance_mechanism && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Governance Mechanism
                          </span>
                          <span>
                            {
                              organization.token_information
                                .governance_mechanism
                            }
                          </span>
                        </div>
                      )}

                      {organization.token_information
                        .link_to_token_contract && (
                        <div className="pt-2">
                          <a
                            href={
                              organization.token_information
                                .link_to_token_contract
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center justify-center w-full p-2 border border-accent/20 rounded-md bg-accent/5 transition-colors hover:bg-accent/10 dark:border-accent/30 dark:bg-accent/10 dark:hover:bg-accent/20"
                          >
                            View Token Contract{" "}
                            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Governance & Certifications */}
            <div className="space-y-6">
              <h3 className="section-heading">
                <Landmark className="h-5 w-5" />
                Governance & Certifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Governance Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {organization.governance_model && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Governance Model</span>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30 dark:text-primary-foreground"
                        >
                          {organization.governance_model}
                        </Badge>
                      </div>
                    )}

                    {organization.number_of_owners_members && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Number of Members</span>
                        <span className="font-semibold text-primary">
                          {organization.number_of_owners_members}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {Array.isArray(organization.certifications_affiliations) &&
                  organization.certifications_affiliations.length > 0 && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          Certifications & Affiliations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-3">
                          {organization.certifications_affiliations.map(
                            (cert, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded-md bg-muted/50 dark:bg-muted/30"
                              >
                                <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                <span>{cert}</span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </div>

            <div className="section-divider"></div>

            {/* Contact & Location */}
            <div className="space-y-6">
              <h3 className="section-heading">
                <Share2 className="h-5 w-5" />
                Contact & Location
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {organization.contact_information && (
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {organization.contact_information.contact_person && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">Contact Person:</span>
                          <span>
                            {organization.contact_information.contact_person}
                          </span>
                        </div>
                      )}

                      {organization.contact_information.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium">Email:</span>
                          <a
                            href={`mailto:${organization.contact_information.email}`}
                            className="text-primary hover:underline"
                          >
                            {organization.contact_information.email}
                          </a>
                        </div>
                      )}

                      {organization.contact_information.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-medium">Phone:</span>
                          <span>{organization.contact_information.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {organization.links_social_media && (
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/30 dark:to-transparent">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Link className="h-5 w-5 text-accent" />
                        Links & Social Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      {Object.entries(organization.links_social_media).map(
                        ([key, value], index) => {
                          if (!value) return null;

                          const getIcon = (platform: string) => {
                            switch (platform.toLowerCase()) {
                              case "website":
                                return <Link className="h-4 w-4 text-accent" />;
                              case "twitter":
                                return (
                                  <Twitter className="h-4 w-4 text-accent" />
                                );
                              case "linkedin":
                                return (
                                  <Linkedin className="h-4 w-4 text-accent" />
                                );
                              case "github":
                                return (
                                  <Github className="h-4 w-4 text-accent" />
                                );
                              case "discord":
                                return (
                                  <MessageSquare className="h-4 w-4 text-accent" />
                                );
                              default:
                                return (
                                  <ExternalLink className="h-4 w-4 text-accent" />
                                );
                            }
                          };

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-accent/5 transition-colors dark:bg-muted/30 dark:hover:bg-accent/10"
                            >
                              {getIcon(key)}
                              <span className="font-medium capitalize">
                                {key}:
                              </span>
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline flex items-center ml-auto"
                              >
                                {value.replace(/https?:\/\/(www\.)?/, "")}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          );
                        }
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {organization.headquarters_location && (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-1 bg-muted/30 p-4 rounded-lg border border-muted dark:bg-muted/20">
                      {organization.headquarters_location.address && (
                        <div className="font-medium">
                          {organization.headquarters_location.address}
                        </div>
                      )}
                      <div>
                        {[
                          organization.headquarters_location.city,
                          organization.headquarters_location.state_region,
                          organization.headquarters_location.zip_postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      {organization.headquarters_location.country && (
                        <div className="font-medium text-primary">
                          {organization.headquarters_location.country}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tags and Metadata */}
            <div className="space-y-6">
              {Array.isArray(organization.tags) &&
                organization.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2 text-primary">
                      <Tag className="h-5 w-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {organization.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:border-accent/30 dark:text-accent-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {organization.date_added_to_directory && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Added: {formatDate(organization.date_added_to_directory)}
                  </div>
                )}
                {organization.last_updated && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Last updated: {formatDate(organization.last_updated)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 flex justify-end p-4 bg-background/95 backdrop-blur-sm border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/40"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
