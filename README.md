# Ownership Economy Directory

## 👋 Welcome to the Ownership Economy Directory!

This project is a modern, interactive directory of organizations within the Ownership Economy ecosystem. It showcases cooperatives, DAOs, employee-owned businesses, and other organizations that embody shared ownership principles.

## 🌟 What's the Ownership Economy?

The Ownership Economy represents a shift toward business models where value is shared more equitably among those who create it. This includes:

- **Cooperatives**: Businesses owned and democratically controlled by their members
- **DAOs (Decentralized Autonomous Organizations)**: Blockchain-based organizations governed by token holders
- **Employee-Owned Businesses**: Companies where employees have an ownership stake
- **Community-Owned Platforms**: Digital platforms owned by their users and contributors


## ✨ Features

- **Interactive Directory**: Browse, search, and filter organizations based on multiple criteria
- **Detailed Organization Profiles**: View comprehensive information about each organization
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Choose your preferred viewing experience
- **Real-time Filtering**: Instantly see results as you apply filters
- **Airtable Integration**: Data is sourced from Airtable for easy management and updates


## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Lucide React icons
- **Data Source**: Airtable API
- **Deployment**: Vercel


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Airtable account with API access


### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```plaintext
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=your_airtable_table_name
AIRTABLE_PAT=your_airtable_personal_access_token
```

### Installation

1. Clone the repository:

```shellscript
git clone https://github.com/KhalidEchchahid/Ownership_economy-_directory
cd Ownership_economy-_directory
```


2. Install dependencies:

```shellscript
npm install
# or
yarn install
```


3. Run the development server:

```shellscript
npm run dev
# or
yarn dev
```


4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## 📊 Airtable Structure

The directory uses an Airtable base with the following structure:

### Main Table: Organizations

Contains the primary organization data with fields like:

- Name
- Description
- Type of Organization
- Industry
- Ownership Structure
- Year Founded
- Geographical Scope
- Size
- Governance Model
- Tags


### Linked Tables:

- **Funding & Financial Information**: Revenue, funding sources
- **Token Information**: Token details for DAOs and crypto projects
- **Contact Information**: Contact details for the organization
- **Links/Social Media**: Website and social media links
- **Headquarters Location**: Physical location information


## 🧭 Project Structure

```plaintext
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   │   └── organizations/# Organizations API endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── organization-card.tsx    # Card component for organizations
│   ├── organization-dialog.tsx  # Dialog for organization details
│   ├── organization-directory.tsx # Main directory component
│   ├── site-header.tsx   # Site header
│   ├── mode-toggle.tsx   # Dark/light mode toggle
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions and types
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Add Organizations**: Submit PRs to add new organizations to the Airtable database
2. **Improve Features**: Enhance the filtering, search, or UI components
3. **Fix Bugs**: Help squash any bugs you find
4. **Documentation**: Improve this README or add more documentation


Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Airtable](https://airtable.com/) - Database and API
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [Vercel](https://vercel.com/) - Deployment platform


---

## 💡 About This Project

The Ownership Economy Directory was created to highlight and connect organizations that are pioneering new models of shared ownership and collaborative governance. By making these organizations more visible and accessible, we hope to accelerate the transition to a more equitable economy where value is shared with those who create it.

If you're building or working with an organization in this space, we'd love to include you in the directory! Reach out or submit a PR to add your organization.

---

Built with ❤️ by Khalid Echchahid
