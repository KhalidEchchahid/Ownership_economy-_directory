"use client";

import { useState, useEffect, useRef } from "react";
import type { Organization } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronsUpDown,
  Filter,
  X,
  Search,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Building2,
  Globe,
  Users,
  Landmark,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrganizationCard } from "./organization-card";
import { OrganizationDialog } from "./organization-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function OrganizationDirectory() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orgTypeFilter, setOrgTypeFilter] = useState("all");
  const [ownershipFilters, setOwnershipFilters] = useState<string[]>([]);
  const [industryFilters, setIndustryFilters] = useState<string[]>([]);
  const [geographicFilter, setGeographicFilter] = useState("all");
  const [governanceFilter, setGovernanceFilter] = useState("all");
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        setOrganizations(data);
        setFilteredOrganizations(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter organizations based on search and filters
  useEffect(() => {
    let result = [...organizations];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (org) =>
          org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (org.description &&
            org.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by organization type
    if (orgTypeFilter && orgTypeFilter !== "all") {
      result = result.filter(
        (org) => org.type_of_organization === orgTypeFilter
      );
    }

    // Filter by ownership structure (multi-select)
    if (ownershipFilters.length > 0) {
      result = result.filter((org) => {
        if (!org.ownership_structure) return false;

        const structures = Array.isArray(org.ownership_structure)
          ? org.ownership_structure
          : [org.ownership_structure];

        return ownershipFilters.some((filter) => structures.includes(filter));
      });
    }

    // Filter by industry (multi-select)
    if (industryFilters.length > 0) {
      result = result.filter((org) => {
        if (!org.industry) return false;
        return industryFilters.some((filter) => org.industry.includes(filter));
      });
    }

    // Filter by geographic scope
    if (geographicFilter && geographicFilter !== "all") {
      result = result.filter(
        (org) => org.geographical_scope === geographicFilter
      );
    }

    // Filter by governance model
    if (governanceFilter && governanceFilter !== "all") {
      result = result.filter(
        (org) => org.governance_model === governanceFilter
      );
    }

    setFilteredOrganizations(result);
  }, [
    searchTerm,
    orgTypeFilter,
    ownershipFilters,
    industryFilters,
    geographicFilter,
    governanceFilter,
    organizations,
  ]);

  // Extract unique values for filter dropdowns
  const orgTypes = [
    ...new Set(organizations.map((org) => org.type_of_organization)),
  ].filter(Boolean);

  const ownershipStructures = [
    ...new Set(
      organizations.flatMap((org) =>
        Array.isArray(org.ownership_structure)
          ? org.ownership_structure
          : [org.ownership_structure]
      )
    ),
  ].filter(Boolean);

  const industries = [
    ...new Set(organizations.map((org) => org.industry)),
  ].filter(Boolean);
  const geographicScopes = [
    ...new Set(organizations.map((org) => org.geographical_scope)),
  ].filter((scope): scope is string => typeof scope === "string");
  const governanceModels = [
    ...new Set(organizations.map((org) => org.governance_model)),
  ].filter((model): model is string => typeof model === "string");

  const resetFilters = () => {
    setSearchTerm("");
    setOrgTypeFilter("all");
    setOwnershipFilters([]);
    setIndustryFilters([]);
    setGeographicFilter("all");
    setGovernanceFilter("all");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleViewDetails = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDialogOpen(true);
  };

  const activeFilterCount = [
    orgTypeFilter !== "all" ? 1 : 0,
    ownershipFilters.length,
    industryFilters.length,
    geographicFilter !== "all" ? 1 : 0,
    governanceFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 overflow-hidden shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="h-10 bg-muted animate-pulse rounded-full"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-[200px] bg-muted animate-pulse rounded-md"></div>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
                  </div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-full flex flex-col overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/10 dark:to-transparent">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-5 w-1/2 bg-muted animate-pulse rounded-md"></div>
                  </div>
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-md"></div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-4 space-y-4">
                <div className="h-12 bg-muted animate-pulse rounded-md"></div>
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded-md"></div>
                  <div className="h-5 bg-muted animate-pulse rounded-md"></div>
                  <div className="h-5 bg-muted animate-pulse rounded-md"></div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center bg-muted/20 dark:bg-muted/10">
                <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 overflow-hidden shadow-md">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search organizations by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input w-full"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tabs
                  defaultValue="grid"
                  value={viewMode}
                  className="w-[200px]"
                  onValueChange={(value) =>
                    setViewMode(value as "grid" | "list")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="grid"
                      className="flex items-center gap-1.5"
                    >
                      <Grid className="h-4 w-4" />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="flex items-center gap-1.5"
                    >
                      <List className="h-4 w-4" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Collapsible
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              className="border rounded-lg"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount} active
                    </Badge>
                  )}
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isFilterOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="px-4 py-3 space-y-4 animate-slide-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Organization Type Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Organization Type</span>
                    </div>
                    <Select
                      value={orgTypeFilter}
                      onValueChange={setOrgTypeFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Organization Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Organization Types
                        </SelectItem>
                        {orgTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ownership Structure - Multi-select */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Ownership Structure</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between",
                            ownershipFilters.length > 0 &&
                              "border-primary/50 bg-primary/5"
                          )}
                        >
                          {ownershipFilters.length > 0 ? (
                            <>
                              {ownershipFilters.length} selected
                              <X
                                className="ml-2 h-4 w-4 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOwnershipFilters([]);
                                }}
                              />
                            </>
                          ) : (
                            <>Select ownership structures</>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search structures..." />
                          <CommandList>
                            <CommandEmpty>No structure found.</CommandEmpty>
                            <CommandGroup>
                              {ownershipStructures.map((structure) => (
                                <CommandItem
                                  key={structure}
                                  onSelect={() => {
                                    setOwnershipFilters((prev) =>
                                      prev.includes(structure)
                                        ? prev.filter(
                                            (item) => item !== structure
                                          )
                                        : [...prev, structure]
                                    );
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      ownershipFilters.includes(structure)
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50"
                                    )}
                                  >
                                    {ownershipFilters.includes(structure) && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                  {structure}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Industry - Multi-select */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Industry</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between",
                            industryFilters.length > 0 &&
                              "border-primary/50 bg-primary/5"
                          )}
                        >
                          {industryFilters.length > 0 ? (
                            <>
                              {industryFilters.length} selected
                              <X
                                className="ml-2 h-4 w-4 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIndustryFilters([]);
                                }}
                              />
                            </>
                          ) : (
                            <>Select industries</>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search industries..." />
                          <CommandList>
                            <CommandEmpty>No industry found.</CommandEmpty>
                            <CommandGroup>
                              {industries.map((industry) => (
                                <CommandItem
                                  key={industry}
                                  onSelect={() => {
                                    setIndustryFilters((prev) =>
                                      prev.includes(industry)
                                        ? prev.filter(
                                            (item) => item !== industry
                                          )
                                        : [...prev, industry]
                                    );
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      industryFilters.includes(industry)
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50"
                                    )}
                                  >
                                    {industryFilters.includes(industry) && (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                  {industry}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Geographic Scope */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Globe className="h-4 w-4 text-primary" />
                      <span>Geographic Scope</span>
                    </div>
                    <Select
                      value={geographicFilter}
                      onValueChange={setGeographicFilter}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          geographicFilter !== "all" &&
                            "border-primary/50 bg-primary/5"
                        )}
                      >
                        <SelectValue placeholder="Geographic Scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Geographic Scopes
                        </SelectItem>
                        {geographicScopes.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Governance Model */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Landmark className="h-4 w-4 text-primary" />
                      <span>Governance Model</span>
                    </div>
                    <Select
                      value={governanceFilter}
                      onValueChange={setGovernanceFilter}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          governanceFilter !== "all" &&
                            "border-primary/50 bg-primary/5"
                        )}
                      >
                        <SelectValue placeholder="Governance Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Governance Models
                        </SelectItem>
                        {governanceModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        Active filters:
                      </span>

                      {orgTypeFilter !== "all" && (
                        <Badge
                          variant="outline"
                          className="filter-pill filter-pill-active"
                          onClick={() => setOrgTypeFilter("all")}
                        >
                          {orgTypeFilter}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      )}

                      {ownershipFilters.map((filter) => (
                        <Badge
                          key={filter}
                          variant="outline"
                          className="filter-pill filter-pill-active"
                          onClick={() =>
                            setOwnershipFilters((prev) =>
                              prev.filter((f) => f !== filter)
                            )
                          }
                        >
                          {filter}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}

                      {industryFilters.map((filter) => (
                        <Badge
                          key={filter}
                          variant="outline"
                          className="filter-pill filter-pill-active"
                          onClick={() =>
                            setIndustryFilters((prev) =>
                              prev.filter((f) => f !== filter)
                            )
                          }
                        >
                          {filter}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}

                      {geographicFilter !== "all" && (
                        <Badge
                          variant="outline"
                          className="filter-pill filter-pill-active"
                          onClick={() => setGeographicFilter("all")}
                        >
                          {geographicFilter}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      )}

                      {governanceFilter !== "all" && (
                        <Badge
                          variant="outline"
                          className="filter-pill filter-pill-active"
                          onClick={() => setGovernanceFilter("all")}
                        >
                          {governanceFilter}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="ml-auto text-sm text-muted-foreground hover:text-destructive"
                      >
                        Reset all filters
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredOrganizations.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {organizations.length}
          </span>{" "}
          organizations
        </p>
        {searchTerm && (
          <p className="text-sm">
            Search results for:{" "}
            <span className="font-medium text-primary">
              &quot;{searchTerm}&quot;
            </span>
          </p>
        )}
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onViewDetails={() => handleViewDetails(org)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                No organizations found matching your criteria.
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Reset filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((org) => (
              <Card key={org.id} className="overflow-hidden card-hover">
                <div className="flex flex-col md:flex-row">
                  <div className="p-4 md:p-6 flex-1">
                    <h3 className="text-lg font-semibold text-primary">
                      {org.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {org.type_of_organization}
                    </p>
                    {org.description && (
                      <p className="text-sm line-clamp-2 mb-3">
                        {org.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {org.industry}
                      </Badge>
                      {org.geographical_scope && (
                        <Badge variant="outline" className="border-primary/20">
                          {org.geographical_scope}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4 md:p-6 flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l bg-muted/20">
                    {org.year_founded && (
                      <div className="text-sm text-muted-foreground">
                        Est. {org.year_founded}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(org)}
                      className="ml-auto md:ml-0 md:mt-4 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                No organizations found matching your criteria.
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Reset filters
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedOrganization && (
        <OrganizationDialog
          organization={selectedOrganization}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}
