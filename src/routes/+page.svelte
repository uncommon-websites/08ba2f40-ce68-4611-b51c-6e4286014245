<script lang="ts">
	// Components
	import Summary from "$lib/components/layout/Summary.svelte";
	import Features from "$lib/components/layout/Features.svelte";
	import CallToAction from "$lib/components/layout/CallToAction.svelte";
	import AboutTeaser from "$lib/components/layout/AboutTeaser.svelte";
	import Hero from "$lib/components/layout/hero-sections/Hero.svelte";

	// Icons
	import GlobeIcon from "~icons/lucide/globe";
	import UserCheckIcon from "~icons/lucide/user-check";
	import DatabaseIcon from "~icons/lucide/database";
	import ActivityIcon from "~icons/lucide/activity";
	import NetworkIcon from "~icons/lucide/network";
	import UseCases from "$lib/components/layout/UseCases.svelte";
	import { cta } from "$lib/navigation";
</script>

<Hero
	callsToAction={[cta]}
	title="A world map for your agents"
	subtitle="Deploy and manage intelligent agents across a global, interactive map, no GIS skills required."
	imageSrc="/generated/image-a-professional-data-analyst-is-standing-.webp"
/>

<Summary
	title="What we do"
	text="Proximity makes geospatial data accessible for all data professionals. Deploy and manage Geospatial AI Agents to generate business insights—no GIS experience needed. "
/>

<Features
	title="Key features"
	subtitle="Everything you need to run agentic geospatial analysis at scale."
	features={[
		{
			title: "Deploy agents globally",
			description:
				"Place AI agents anywhere on a global hex grid and launch them instantly—no GIS training needed.",
			icon: GlobeIcon
		},
		{
			title: "No GIS expertise required",
			description:
				"Built for data analysts and product managers, not GIS professionals; start analyzing from day one.",
			icon: UserCheckIcon
		},
		{
			title: "Seamless geospatial data integration",
			description:
				"Bring in messy datasets and harmonize them for instant use; we handle the technical details.",
			icon: DatabaseIcon
		},
		{
			title: "Real-time agent visualization",
			description:
				"Watch agent activity and results update live, so you always know what's happening and where.",
			icon: ActivityIcon
		},
		{
			title: "Scale with multi-agent support",
			description:
				"Deploy one or hundreds of agents at once, managing global analysis from a single interface.",
			icon: NetworkIcon
		}
	]}
/>

<!-- <UseCases
	title="Use Cases"
	subtitle="Real-world applications for your business needs"
	useCases={[
		{
			title: "Retail site selection",
			description:
				"Deploy agents on the map to compare potential sites across cities or countries; instantly analyze foot traffic, local competition, and demographic fit to pick the best location for expansion—no GIS background needed.",
			image: "/generated/image-a-business-analyst-standing-thoughtfully.webp",
			link: {
				href: "/use-cases/retail-site-selection",
				label: "Learn more"
			}
		},
		{
			title: "Emergency resource deployment",
			description:
				"Use intelligent agents to optimize placement of emergency teams and equipment; simulate best routes and staging areas for rapid response to crises spanning floods, fires, or power outages—at municipal or national scale.",
			image: "/generated/image-an-emergency-response-team-gathered-in-a.webp",
			link: {
				href: "/use-cases/emergency-resource-deployment",
				label: "Learn more"
			}
		},
		{
			title: "Logistics route planning",
			description:
				"Coordinate delivery and supply chain agents over a global map; model routes, avoid bottlenecks, and optimize last-mile efficiency—making real-time adjustments as demand and disruptions change.",
			image: "/generated/image-a-logistics-manager-overseeing-warehouse.webp",
			link: {
				href: "/use-cases/logistics-route-planning",
				label: "Learn more"
			}
		}
	]}
/> -->

<AboutTeaser />
<CallToAction
	title="Put agents on the map"
	subtitle="Geospatial insights, minus the complexity"
	description="Join forward-thinking analysts using Proximity to deploy AI agents anywhere on the globe—no GIS background needed. Surface insights, speed up analysis, and focus on business value, not wrangling data."
	imageSrc="/generated/image-a-professional-data-analyst-is-standing-.webp"
	callsToAction={[cta]}
/>
