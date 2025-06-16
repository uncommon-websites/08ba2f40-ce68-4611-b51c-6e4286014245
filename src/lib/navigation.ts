/**
 * DO NOT REMOVE THIS COMMENT
 * @remarks
 * Navigation Structure Example:
 *
 * **Product**
 * - Overview
 * - Solutions
 * - Use Cases
 * - Pricing
 * ---
 * **Resources**
 * - Blog
 * - Playbooks
 * - Customer stories
 * - Webinars
 * - Darwin Academy
 * - Documentation
 * - Marketplaces
 * - Community
 * ---
 * **Company**
 * - Careers
 * - About us
 * - News
 * - Legal
 * - Security
 * - Events
 * - Contact
 * - Social media
 */

// Types
export type NavItem = {
	label: string;
	href?: string;
	image?: string;
	showInNav?: boolean;
	showInFooter?: boolean;

	children?: (Omit<NavItem, "children" | "image"> & {
		image?: string;
		description?: string;
		showInNav?: boolean;
		showInFooter?: boolean;
	})[];
};

export const cta = {
	label: "Book demo",
	href: "/"
};

export const navigation: NavItem[] = [
	{
		label: "Pricing",
		href: "/pricing",
		showInNav: true,
		showInFooter: false
	},
	{
		label: "Use Cases",
		showInNav: true,
		showInFooter: true,
		children: [
			{
				label: "Retail site selection",
				href: "/use-cases/retail-site-selection",
				image: "/generated/image-a-group-of-diverse-urban-planners-gather.webp",
				description: "Deploy agents on the map to compare potential sites and analyze local data—demographic fit, traffic, and competition—for confident retail expansion.",
				showInNav: true,
				showInFooter: true
			},
			{
				label: "Emergency resource deployment",
				href: "/use-cases/emergency-resource-deployment",
				image: "/generated/image-a-team-of-emergency-response-professiona.webp",
				description: "Intelligent agents optimize where to place teams and equipment, simulating real-time routes for rapid disaster response and crisis management.",
				showInNav: true,
				showInFooter: true
			},
			{
				label: "Logistics route planning",
				href: "/use-cases/logistics-route-planning",
				image: "/generated/image-a-logistics-team-in-a-spacious-well-lit-.webp",
				description: "Coordinate delivery and supply chain agents globally—optimize routes, avoid bottlenecks, and update as demand shifts.",
				showInNav: true,
				showInFooter: true
			}
		]
	},
	{
		label: "Company",
		showInNav: true,
		showInFooter: true,
		children: [
			{
				label: "About us",
				href: "/about",
				showInNav: true,
				showInFooter: true
			},
			{
				label: "Pricing",
				href: "/pricing",
				showInNav: false,
				showInFooter: true
			},
			{
				label: "Careers",
				href: "/careers",
				showInNav: true,
				showInFooter: true
			}
		]
	},
	{
		label: "More",
		showInNav: false,
		showInFooter: true,
		children: [
			{
				label: "Privacy",
				href: "/legal/privacy",
				showInNav: false,
				showInFooter: true
			},
			{
				label: "Terms",
				href: "/legal/terms",
				showInNav: false,
				showInFooter: true
			}
			// Social media might be handled differently, not typically a nav item
		]
	}
];
// .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0));
