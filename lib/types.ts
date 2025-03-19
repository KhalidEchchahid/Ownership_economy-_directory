export interface Organization {
    id: string
    name: string
    description?: string
    type_of_organization: string
    industry: string
    ownership_structure: string[] | string
    legal_structure?: string
    year_founded?: number
    headquarters_location?: {
      address?: string
      city?: string
      state_region?: string
      country?: string
      zip_postal_code?: string
    }
    geographical_scope?: string
    size?: string
    number_of_owners_members?: number
    funding_financial_information?: {
      funding_sources?: string[]
      revenue?: string
    }
    token_information?: {
      token_name?: string
      token_symbol?: string
      blockchain_platform?: string
      governance_mechanism?: string
      link_to_token_contract?: string
    }
    governance_model?: string
    links_social_media?: {
      website?: string
      twitter?: string
      linkedin?: string
      discord?: string
      github?: string
    }
    contact_information?: {
      contact_person?: string
      email?: string
      phone?: string
    }
    certifications_affiliations?: string[]
    tags?: string[]
    date_added_to_directory?: string
    last_updated?: string
  }
  
  