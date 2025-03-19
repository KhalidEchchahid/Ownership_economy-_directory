import { NextResponse } from "next/server";
import Airtable from "airtable";

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

interface LinkedRecords {
  [tableName: string]: {
    [recordId: string]: Record<string, any>;
  };
}

export async function GET() {
  try {

    // Configure Airtable with Personal Access Token
    const baseId = process.env.AIRTABLE_BASE_ID || "app16H4EjjKyeOv8l";
    const tableId = process.env.AIRTABLE_TABLE_NAME || "tblh9V3TVD0B3FKeU";
    const token = process.env.AIRTABLE_PAT || "pat9hMSRIv0gvgTod.563abbf67feeaaeb6cbec542319c7bab2a266097cbb0b01e39f093f98794bb04";

    // Use the Airtable library
    const base = new Airtable({ apiKey: token }).base(baseId);

    // Fetch records from the table
    const records = await base(tableId).select({}).all();

    // Create a map of linked record tables we need to fetch
    const linkedTableIds = new Set<string>();
    const linkedRecordIds: Record<string, Set<string>> = {};

    // First pass - identify all linked records we need to fetch
    records.forEach((record: AirtableRecord) => {
      const fields = record.fields;

      // Check for linked records and collect their IDs
      Object.entries(fields).forEach(([fieldName, value]) => {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "string" &&
          value[0].startsWith("rec")
        ) {
          // This looks like a linked record array

          // Try to determine which table this field links to
          // This is a simplification - you might need to use field metadata from Airtable
          const tableGuess = fieldName.replace(/[_\s]/g, "").toLowerCase();

          if (!linkedRecordIds[tableGuess]) {
            linkedRecordIds[tableGuess] = new Set<string>();
            linkedTableIds.add(tableGuess);
          }

          // Add all record IDs to fetch
          value.forEach((id: string) => linkedRecordIds[tableGuess].add(id));
        }
      });
    });

    // Fetch linked records for each table we identified
    const linkedRecords: LinkedRecords = {};

    // This is simplified - in reality, you would need to know which table ID corresponds to each linked field
    // You might need to create a mapping or fetch schema information from Airtable
    await Promise.all(
      Array.from(linkedTableIds).map(async (tableName) => {
        try {
          // Try to determine the actual table ID - this is just a guess based on field naming
          // In practice, you might need to maintain a mapping of field names to table IDs
          const recordIds = Array.from(linkedRecordIds[tableName] || []);

          if (recordIds.length === 0) return;

          // Try to fetch linked records - note that this is speculative
          // In reality, you'd need the correct table ID for each linked record type
          const linkedTableRecords = await Promise.all(
            recordIds.map((id) => {
              try {
                // Try with a few possible table names
                return base(tableId).find(id);
              } catch (e) {
                console.warn(
                  `Unable to find record ${id} in main table, might be in a different table`
                );
                return null;
              }
            })
          );

          // Create lookup for these records
          linkedTableRecords.forEach((record) => {
            if (record) {
              if (!linkedRecords[tableName]) linkedRecords[tableName] = {};
              linkedRecords[tableName][record.id] = record.fields;
            }
          });
        } catch (error) {
          console.error(
            `Error fetching linked records for ${tableName}:`,
            error
          );
        }
      })
    );

    // Transform Airtable records with expanded linked records
    const organizations = records.map((record: AirtableRecord) => {
      const fields = record.fields;

      // Helper function to find field value regardless of case
      const getField = (possibleNames: string[]): any => {
        for (const name of possibleNames) {
          if (fields[name] !== undefined) return fields[name];
        }
        return null;
      };

      // Helper function to parse tags if they're in a string format with separators
      const parseTags = (tags: any): string[] => {
        if (!tags) return [];
        if (Array.isArray(tags)) {
          // If it's already an array, return it
          return tags;
        }
        if (typeof tags === "string") {
          // Check if it's a semicolon or comma separated string
          if (tags.includes(";")) {
            return tags.split(";").map((tag) => tag.trim());
          }
          if (tags.includes(",")) {
            return tags.split(",").map((tag) => tag.trim());
          }
          // If no separators, treat as a single tag
          return [tags];
        }
        return [tags];
      };

      // Handle ownership structure
      let ownershipStructure = getField([
        "Ownership Structure",
        "ownership_structure",
        "ownershipStructure",
      ]);

      if (ownershipStructure) {
        if (Array.isArray(ownershipStructure)) {
          // If it's already an array, check if items need to be split
          ownershipStructure = ownershipStructure.flatMap((item) => {
            if (
              typeof item === "string" &&
              (item.includes(";") || item.includes(","))
            ) {
              return item.includes(";")
                ? item.split(";").map((s) => s.trim())
                : item.split(",").map((s) => s.trim());
            }
            return item;
          });
        } else if (typeof ownershipStructure === "string") {
          // If it's a string, check for separators
          if (ownershipStructure.includes(";")) {
            ownershipStructure = ownershipStructure
              .split(";")
              .map((s) => s.trim());
          } else if (ownershipStructure.includes(",")) {
            ownershipStructure = ownershipStructure
              .split(",")
              .map((s) => s.trim());
          } else {
            ownershipStructure = [ownershipStructure];
          }
        } else {
          ownershipStructure = [ownershipStructure];
        }
      } else {
        ownershipStructure = [];
      }

      // Get tags and parse them
      const tags = parseTags(getField(["Tags", "tags"]));

      // Get certifications and parse them
      const certifications = parseTags(
        getField([
          "Certifications & Affiliations",
          "certifications_affiliations",
          "certificationsAffiliations",
        ])
      );

      // NEW: Get actual linked record data instead of just IDs

      // Token Information
      const tokenInfoRecordIds = getField([
        "Token Information",
        "token_information",
        "tokenInformation",
      ]);
      let tokenInfo: Record<string, string> | null = null;

      if (
        tokenInfoRecordIds &&
        Array.isArray(tokenInfoRecordIds) &&
        tokenInfoRecordIds.length > 0
      ) {
        const recordId = tokenInfoRecordIds[0];
        // Try to find the linked record data
        const linkedData = linkedRecords.tokeninformation?.[recordId] || null;

        if (linkedData) {
          // Use the linked data
          tokenInfo = {
            token_name: linkedData.token_name || linkedData.tokenName || "",
            token_symbol:
              linkedData.token_symbol || linkedData.tokenSymbol || "",
            blockchain_platform:
              linkedData.blockchain_platform ||
              linkedData.blockchainPlatform ||
              "",
            governance_mechanism:
              linkedData.governance_mechanism ||
              linkedData.governanceMechanism ||
              "",
            link_to_token_contract:
              linkedData.link_to_token_contract ||
              linkedData.linkToTokenContract ||
              "",
          };
        } else {
          // Fall back to the fields in the main record
          tokenInfo = {
            token_name:
              getField(["token_name", "tokenName"]) || "Unknown Token",
            token_symbol: getField(["token_symbol", "tokenSymbol"]) || "",
            blockchain_platform:
              getField(["blockchain_platform", "blockchainPlatform"]) ||
              "Ethereum",
            governance_mechanism:
              getField(["Governance Model", "governance_model"]) || "Unknown",
            link_to_token_contract:
              getField(["link_to_token_contract", "linkToTokenContract"]) || "",
          };
        }
      }

      // Funding Information
      const fundingInfoRecordIds = getField([
        "Funding & Financial Information",
        "funding_and_financial_information",
        "fundingAndFinancialInformation",
        "funding_financial_information",
      ]);

      let fundingInfo: { funding_sources: string[]; revenue: string } = {
        funding_sources: [],
        revenue: "Unknown",
      };

      if (
        fundingInfoRecordIds &&
        Array.isArray(fundingInfoRecordIds) &&
        fundingInfoRecordIds.length > 0
      ) {
        const recordId = fundingInfoRecordIds[0];

        // Instead of trying to fetch directly, we need to look for the record in our linked tables mapping
        // We already have the linkedRecords object from earlier in your code

        // Try to find the record in any of these possible table keys
        const possibleTableKeys = [
          "fundingandfinancialinformation",
          "fundingfinancialinformation",
          "funding",
          "financial",
        ];

        let linkedData = null;

        // Check each possible key to find our record
        for (const key of possibleTableKeys) {
          if (linkedRecords[key] && linkedRecords[key][recordId]) {
            linkedData = linkedRecords[key][recordId];
            break;
          }
        }

        if (linkedData) {
          // Use the linked data
          fundingInfo = {
            funding_sources:
              parseTags(
                linkedData.funding_sources || linkedData.fundingSources
              ) || [],
            revenue: linkedData.revenue || linkedData.Revenue || "Unknown",
          };
        } else {
          // Fall back to fields in the main record
          fundingInfo = {
            funding_sources:
              parseTags(getField(["funding_sources", "fundingSources"])) || [],
            revenue: getField(["revenue", "Revenue"]) || "Unknown",
          };
        }
      } else {
        // No linked record IDs found
        fundingInfo = {
          funding_sources:
            parseTags(getField(["funding_sources", "fundingSources"])) || [],
          revenue: getField(["revenue", "Revenue"]) || "Unknown",
        };
      }

      // Contact Information
      const contactInfoRecordIds = getField([
        "Contact Information",
        "contact_information",
        "contactInformation",
      ]);

      let contactInfo: Record<string, string> | null = null;

      if (
        contactInfoRecordIds &&
        Array.isArray(contactInfoRecordIds) &&
        contactInfoRecordIds.length > 0
      ) {
        const recordId = contactInfoRecordIds[0];
        // Try to find the linked record data
        const linkedData = linkedRecords.contactinformation?.[recordId] || null;

        if (linkedData) {
          // Use the linked data
          contactInfo = {
            contact_person:
              linkedData.contact_person || linkedData.contactPerson || "",
            email: linkedData.email || linkedData.Email || "",
            phone: linkedData.phone || linkedData.Phone || "",
          };
        } else {
          // Fall back to fields in the main record
          contactInfo = {
            contact_person: getField(["contact_person", "contactPerson"]) || "",
            email: getField(["email", "Email"]) || "",
            phone: getField(["phone", "Phone"]) || "",
          };
        }
      } else {
        // Initialize with empty values if no linked records
        contactInfo = {
          contact_person: getField(["contact_person", "contactPerson"]) || "",
          email: getField(["email", "Email"]) || "",
          phone: getField(["phone", "Phone"]) || "",
        };
      }

      // Links/Social Media
      const linksInfoRecordIds = getField([
        "Links/Social Media",
        "Links_social_media",
        "links_social_media",
        "linksSocialMedia",
      ]);

      let linksInfo: Record<string, string> | null = null;

      if (
        linksInfoRecordIds &&
        Array.isArray(linksInfoRecordIds) &&
        linksInfoRecordIds.length > 0
      ) {
        const recordId = linksInfoRecordIds[0];
        // Try to find the linked record data
        const linkedData =
          linkedRecords.linkssocialmedia?.[recordId] ||
          linkedRecords.links?.[recordId] ||
          linkedRecords.socialmedia?.[recordId] ||
          null;

        if (linkedData) {
          // Use the linked data
          linksInfo = {
            website: linkedData.website || linkedData.Website || "",
            twitter: linkedData.twitter || linkedData.Twitter || "",
            linkedin:
              linkedData.linkedin ||
              linkedData.LinkedIn ||
              linkedData.linkdeIn ||
              "",
            discord: linkedData.discord || linkedData.Discord || "",
            github:
              linkedData.github || linkedData.Github || linkedData.GitHub || "",
          };
        } else {
          // Fall back to fields in the main record
          linksInfo = {
            website: getField(["website", "Website"]) || "",
            twitter: getField(["twitter", "Twitter"]) || "",
            linkedin: getField(["linkedin", "LinkedIn", "linkdeIn"]) || "",
            discord: getField(["discord", "Discord"]) || "",
            github: getField(["github", "Github", "GitHub"]) || "",
          };
        }
      } else {
        // Initialize with empty values if no linked records
        linksInfo = {
          website: getField(["website", "Website"]) || "",
          twitter: getField(["twitter", "Twitter"]) || "",
          linkedin: getField(["linkedin", "LinkedIn", "linkdeIn"]) || "",
          discord: getField(["discord", "Discord"]) || "",
          github: getField(["github", "Github", "GitHub"]) || "",
        };
      }

      // Headquarters Location
      const headquartersRecordIds = getField([
        "Headquarters Location",
        "headquarters",
        "headquartersLocation",
      ]);

      let locationInfo: Record<string, string> | null = null;

      if (
        headquartersRecordIds &&
        Array.isArray(headquartersRecordIds) &&
        headquartersRecordIds.length > 0
      ) {
        const recordId = headquartersRecordIds[0];
        // Try to find the linked record data
        const linkedData =
          linkedRecords.headquarters?.[recordId] ||
          linkedRecords.headquarterslocation?.[recordId] ||
          linkedRecords.table2?.[recordId] ||
          null;

        if (linkedData) {
          // Use the linked data
          locationInfo = {
            address: linkedData.address || linkedData.Address || "",
            city: linkedData.city || linkedData.City || "",
            state_region:
              linkedData.state_region ||
              linkedData.stateRegion ||
              linkedData["State/Region"] ||
              "",
            country: linkedData.country || linkedData.Country || "",
            zip_postal_code:
              linkedData.zip_postal_code ||
              linkedData.zipPostalCode ||
              linkedData["Zip/Postal Code"] ||
              "",
          };
        } else {
          // Fall back to fields in the main record
          locationInfo = {
            address: getField(["address", "Address"]) || "",
            city: getField(["city", "City"]) || "",
            state_region:
              getField(["state_region", "stateRegion", "State/Region"]) || "",
            country: getField(["country", "Country"]) || "",
            zip_postal_code:
              getField([
                "zip_postal_code",
                "zipPostalCode",
                "Zip/Postal Code",
              ]) || "",
          };
        }
      } else {
        // Initialize with empty values if no linked records
        locationInfo = {
          address: getField(["address", "Address"]) || "",
          city: getField(["city", "City"]) || "",
          state_region:
            getField(["state_region", "stateRegion", "State/Region"]) || "",
          country: getField(["country", "Country"]) || "",
          zip_postal_code:
            getField(["zip_postal_code", "zipPostalCode", "Zip/Postal Code"]) ||
            "",
        };
      }

      return {
        id: getField(["id", "ID"]) || record.id,
        name: getField(["Name", "name"]) || "Unnamed Organization",
        description: getField(["Description", "description"]),
        type_of_organization: getField([
          "Type of Organization",
          "type_of_organization",
          "typeOfOrganization",
        ]),
        industry: getField(["Industry", "industry"]),
        ownership_structure: ownershipStructure,
        legal_structure: getField([
          "Legal Structure",
          "legal_structure",
          "legalStructure",
        ]),
        year_founded: getField(["Year Founded", "year_founded", "yearFounded"]),
        headquarters_location: locationInfo,
        geographical_scope: getField([
          "Geographical Scope",
          "geographical_scope",
          "geographicalScope",
        ]),
        size: getField(["Size", "size"]),
        number_of_owners_members: getField([
          "Number of Owners/Members",
          "number_of_owners_members",
          "numberOfOwnersMembers",
        ]),
        funding_financial_information: fundingInfo,
        token_information: tokenInfo,
        governance_model: getField([
          "Governance Model",
          "governance_model",
          "governanceModel",
        ]),
        links_social_media: linksInfo,
        contact_information: contactInfo,
        certifications_affiliations: certifications,
        tags: tags,
        date_added_to_directory: getField([
          "Date Added to Directory",
          "date_added",
          "dateAddedToDirectory",
        ]),
        last_updated: getField(["Last Updated", "last_update", "lastUpdated"]),
      };
    });
    console.log("Fetched organizations from Airtable:", organizations[0]);
    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch organizations", details: errorMessage },
      { status: 500 }
    );
  }
}
