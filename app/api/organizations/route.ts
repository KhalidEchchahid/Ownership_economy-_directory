/**
 * Organizations API Route
 *
 * This file handles fetching organization data from Airtable and transforming it
 * into a consistent format for our frontend. It deals with the complexities of
 * Airtable's linked records and various field naming conventions.
 *
 * The main challenges this solves:
 * 1. Fetching data from Airtable using their API
 * 2. Handling linked records (like contact info, funding details, etc.)
 * 3. Normalizing field names that might vary in the database
 * 4. Parsing complex fields like arrays and delimited strings
 */

import { NextResponse } from "next/server";
import Airtable from "airtable";

// Define types to help us work with Airtable's data structure
interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

// This helps us organize linked records by table name and record ID
interface LinkedRecords {
  [tableName: string]: {
    [recordId: string]: Record<string, any>;
  };
}

export async function GET() {
  try {
    // Set up our Airtable connection
    // We use environment variables, but have fallbacks for development
    const baseId = process.env.AIRTABLE_BASE_ID || "app16H4EjjKyeOv8l";
    const tableId = process.env.AIRTABLE_TABLE_NAME || "tblh9V3TVD0B3FKeU";
    const token =
      process.env.AIRTABLE_PAT ||
      "pat9hMSRIv0gvgTod.563abbf67feeaaeb6cbec542319c7bab2a266097cbb0b01e39f093f98794bb04";

    // Initialize the Airtable library with our credentials
    const base = new Airtable({ apiKey: token }).base(baseId);

    // Fetch all records from our main organizations table
    //TODO: Add pagination support for large datasets
    const records = await base(tableId).select({}).all();

    // ---- STEP 1: IDENTIFY LINKED RECORDS ----

    // Airtable stores related data in separate tables, connected by record IDs
    // We need to figure out which linked records we need to fetch
    const linkedTableIds = new Set<string>();
    const linkedRecordIds: Record<string, Set<string>> = {};

    // Look through all records to find linked record IDs
    records.forEach((record: AirtableRecord) => {
      const fields = record.fields;

      // Check each field to see if it contains linked record IDs
      Object.entries(fields).forEach(([fieldName, value]) => {
        // Linked records in Airtable appear as arrays of IDs that start with "rec"
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "string" &&
          value[0].startsWith("rec")
        ) {
          // We need to guess which table this field links to based on its name
          // This is a bit of a hack, but Airtable doesn't give us this info directly : (got this from google)
          const tableGuess = fieldName.replace(/[_\s]/g, "").toLowerCase();

          // Initialize a set to collect record IDs for this table if we haven't already
          if (!linkedRecordIds[tableGuess]) {
            linkedRecordIds[tableGuess] = new Set<string>();
            linkedTableIds.add(tableGuess);
          }

          // Add all the record IDs we found to our collection
          value.forEach((id: string) => linkedRecordIds[tableGuess].add(id));
        }
      });
    });

    // ---- STEP 2: FETCH LINKED RECORDS ----

    // Now that we know which records we need, let's fetch them
    const linkedRecords: LinkedRecords = {};

    /// Try to fetch all the linked records we identified
    // This is tricky because we don't know for sure which table they're in
    await Promise.all(
      Array.from(linkedTableIds).map(async (tableName) => {
        try {
          // Get the list of record IDs we need for this table
          const recordIds = Array.from(linkedRecordIds[tableName] || []);

          // Skip if there's nothing to fetch
          if (recordIds.length === 0) return;

          // Try to find these records in the main table
          // In a perfect world, we'd know exactly which table to look in,
          // but we're making an educated guess here
          const linkedTableRecords = await Promise.all(
            recordIds.map((id) => {
              try {
                // Try to find the record in the main table
                return base(tableId).find(id);
              } catch (e) {
                // If we can't find it, log a warning and move on
                console.warn(
                  `Unable to find record ${id} in main table, might be in a different table`
                );
                return null;
              }
            })
          );

          // Organize the records we found by their ID for easy lookup later
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

    // ---- STEP 3: TRANSFORM RECORDS INTO OUR FORMAT ----

    // Now we'll convert the Airtable records into our application's format
    const organizations = records.map((record: AirtableRecord) => {
      const fields = record.fields;

      // This helper function finds a field value by trying different possible field names
      // This is super helpful because field names in Airtable might vary (e.g., "Name" vs "name")
      const getField = (possibleNames: string[]): any => {
        for (const name of possibleNames) {
          if (fields[name] !== undefined) return fields[name];
        }
        return null;
      };

      // This helper parses tags that might be stored as semicolon or comma-separated strings
      // For example, "tag1; tag2; tag3" becomes ["tag1", "tag2", "tag3"]
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

      // ---- HANDLE OWNERSHIP STRUCTURE ----

      // This field can be complex - it might be an array, a delimited string, or a single value
      let ownershipStructure = getField([
        "Ownership Structure",
        "ownership_structure",
        "ownershipStructure",
      ]);

      // Process ownership structure into a consistent array format
      if (ownershipStructure) {
        if (Array.isArray(ownershipStructure)) {
          // If it's already an array, check if items need to be split
          // (sometimes array items themselves contain delimited values)
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
          // If it's a string, check for separators and split accordingly
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
          // For any other type, wrap it in an array
          ownershipStructure = [ownershipStructure];
        }
      } else {
        // If no ownership structure, use an empty array
        ownershipStructure = [];
      }

      // Parse tags and certifications into arrays
      const tags = parseTags(getField(["Tags", "tags"]));

      // Get certifications and parse them
      const certifications = parseTags(
        getField([
          "Certifications & Affiliations",
          "certifications_affiliations",
          "certificationsAffiliations",
        ])
      );

      // ---- PROCESS LINKED RECORDS ----

      // For each type of linked record, we'll try to find the data
      // and fall back to direct fields if we can't find the linked record

      // ---- TOKEN INFORMATION ----

      const tokenInfoRecordIds = getField([
        "Token Information",
        "token_information",
        "tokenInformation",
      ]);
      let tokenInfo: Record<string, string> | null = null;

      // If we have token info record IDs, try to get the linked data
      if (
        tokenInfoRecordIds &&
        Array.isArray(tokenInfoRecordIds) &&
        tokenInfoRecordIds.length > 0
      ) {
        const recordId = tokenInfoRecordIds[0];
        // Try to find the linked record data
        const linkedData = linkedRecords.tokeninformation?.[recordId] || null;

        if (linkedData) {
          // If we found the linked data, use it
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
          // If we couldn't find the linked data, try to use fields from the main record
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

      // ---- FUNDING INFORMATION ----

      const fundingInfoRecordIds = getField([
        "Funding & Financial Information",
        "funding_and_financial_information",
        "fundingAndFinancialInformation",
        "funding_financial_information",
      ]);

      // Initialize with default values to avoid null issues

      let fundingInfo: { funding_sources: string[]; revenue: string } = {
        funding_sources: [],
        revenue: "Unknown",
      };

      // If we have funding info record IDs, try to get the linked data
      if (
        fundingInfoRecordIds &&
        Array.isArray(fundingInfoRecordIds) &&
        fundingInfoRecordIds.length > 0
      ) {
        const recordId = fundingInfoRecordIds[0];

        // The table name for funding info could be several different things
        // Let's check all the possibilities
        const possibleTableKeys = [
          "fundingandfinancialinformation",
          "fundingfinancialinformation",
          "funding",
          "financial",
        ];

        let linkedData = null;

        // Try each possible table name until we find our record
        for (const key of possibleTableKeys) {
          if (linkedRecords[key] && linkedRecords[key][recordId]) {
            linkedData = linkedRecords[key][recordId];
            break;
          }
        }

        if (linkedData) {
          // If we found the linked data, use it
          fundingInfo = {
            funding_sources:
              parseTags(
                linkedData.funding_sources || linkedData.fundingSources
              ) || [],
            revenue: linkedData.revenue || linkedData.Revenue || "Unknown",
          };
        } else {
          // If we couldn't find the linked data, try to use fields from the main record
          fundingInfo = {
            funding_sources:
              parseTags(getField(["funding_sources", "fundingSources"])) || [],
            revenue: getField(["revenue", "Revenue"]) || "Unknown",
          };
        }
      } else {
        // If no linked record IDs, try to get direct fields
        fundingInfo = {
          funding_sources:
            parseTags(getField(["funding_sources", "fundingSources"])) || [],
          revenue: getField(["revenue", "Revenue"]) || "Unknown",
        };
      }

      // ---- CONTACT INFORMATION ----
      const contactInfoRecordIds = getField([
        "Contact Information",
        "contact_information",
        "contactInformation",
      ]);

      // Initialize with empty values to avoid null issues
      let contactInfo: Record<string, string> | null = null;
      // If we have contact info record IDs, try to get the linked data
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

      // ---- LINKS/SOCIAL MEDIA ----
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
      // ---- ASSEMBLE THE FINAL ORGANIZATION OBJECT ----
      // Put everything together into our standardized organization format
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

    // Log the first organization for debugging purposes
    console.log("Fetched organizations from Airtable:", organizations[0]);
    return NextResponse.json(organizations);
  } catch (error) {
    // If anything goes wrong, log the error and return a 500 response
    console.error("Error fetching data from Airtable:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch organizations", details: errorMessage },
      { status: 500 }
    );
  }
}
