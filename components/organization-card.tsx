"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Globe,
  Users,
  Building,
  Calendar,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import type { Organization } from "@/lib/types";

interface OrganizationCardProps {
  organization: Organization;
  onViewDetails: () => void;
}

export function OrganizationCard({
  organization,
  onViewDetails,
}: OrganizationCardProps) {
  // Get website URL from links_social_media if it exists
  const websiteUrl = organization.links_social_media?.website;

  // Parse tags if they're in a string format
  interface Tag {
    [key: string]: string | string[];
  }

  const parseTags = (tags: string | string[] | Tag | undefined): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags.flatMap((tag) =>
        typeof tag === "string" && tag.includes(";")
          ? tag.split(";").map((t) => t.trim())
          : tag
      );
    }
    if (typeof tags === "string") {
      return tags.includes(";") ? tags.split(";").map((t) => t.trim()) : [tags];
    }
    return [tags as unknown as string];
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
    <Card className="h-full flex flex-col overflow-hidden card-hover">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl line-clamp-1 text-primary">
              {organization.name}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <Badge
                className={getTypeColor(organization.type_of_organization)}
              >
                {organization.type_of_organization}
              </Badge>
            </CardDescription>
          </div>
          {organization.year_founded && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-primary/20 dark:border-primary/30"
            >
              <Calendar className="h-3 w-3" />
              {organization.year_founded}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {organization.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {organization.description}
          </p>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <Badge
              variant="secondary"
              className="font-normal bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            >
              {organization.industry}
            </Badge>
          </div>

          {organization.geographical_scope && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>{organization.geographical_scope}</span>
            </div>
          )}

          {organization.size && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{organization.size}</span>
            </div>
          )}

          {Array.isArray(organization.ownership_structure) &&
            organization.ownership_structure.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {organization.ownership_structure
                  .slice(0, 2)
                  .map((structure, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-primary/20 dark:border-primary/30"
                    >
                      {structure}
                    </Badge>
                  ))}
                {organization.ownership_structure.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/20 dark:border-primary/30"
                  >
                    +{organization.ownership_structure.length - 2} more
                  </Badge>
                )}
              </div>
            )}

          {organization.tags && organization.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {parseTags(organization.tags)
                .slice(0, 2)
                .map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:border-accent/30 dark:text-accent-foreground"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              {parseTags(organization.tags).length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs border-primary/20 dark:border-primary/30"
                >
                  +{parseTags(organization.tags).length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center bg-muted/20 dark:bg-muted/10">
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1 text-primary hover:underline"
          >
            Website <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">No website</span>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="flex items-center gap-1 text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
        >
          Details <ArrowUpRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
