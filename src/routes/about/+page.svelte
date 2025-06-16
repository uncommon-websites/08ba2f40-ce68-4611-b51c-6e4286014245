<script lang="ts">
	// Components
	import CallToAction from "$lib/components/layout/CallToAction.svelte";

	// Icons
	import StakeholderGrid from "$lib/components/layout/StakeholderGrid.svelte";
	import Story from "./Story.svelte";
	import SecondaryHero from "$lib/components/layout/hero-sections/SecondaryHero.svelte";
	import Culture from "$lib/components/layout/Culture.svelte";

	// Constants
	const values = [
 {
   title: "Curiosity drives us",
   description: "We ask why and what if—continually exploring better ways to connect data, technology, and people."
 },
 {
   title: "Playful creativity",
   description: "Inspired by games, we design intuitive experiences that make even the hardest problems feel approachable—and fun."
 },
 {
   title: "Simple over complex",
   description: "We break down geospatial challenges to help anyone use powerful location intelligence, no GIS background needed."
 },
 {
   title: "Strength in diversity",
   description: "We lean on a team with backgrounds in data, engineering, gaming, and beyond—building something none of us could create alone."
 },
 {
   title: "Collaboration above ego",
   description: "We work together generously, celebrating learning, feedback, and different ways of thinking."
 }
];
</script>

<SecondaryHero
	title="Geospatial insights, without the GIS"
	subtitle="Deploy AI agents on a global, interactive map—no mapping expertise required"
	imageSrc="/mockups/airport-screen-1750069576821.png"
/>

<!-- Story Section -->
<Story
	paragraphs={[
    "For years, geospatial data was locked behind technical walls and complex tools, used only by a small group of GIS specialists. We saw a big gap: so many data analysts needed location insights, but the barrier to entry was steep.",
    "That’s why Kornel Grunwald and Szymon Moliński built Proximity—pairing cutting-edge AI with a map interface inspired by the best strategy games. With Proximity, anyone can deploy AI agents across a global grid, see results in real time, and actually interact with geospatial data, no learning curve required.",
    "Today, Proximity empowers all kinds of teams to make smarter market moves, select sites, and uncover trends—not just map experts. We believe geospatial thinking should be easy, intuitive, and open to everyone who makes data-driven decisions."
]}
/>

<!-- Our Culture Section -->
<Culture {values} />

<!-- StakeholderGrid Section -->
<StakeholderGrid
  stakeholderType="team"
  title="Meet the founders"
  subtitle="Two technologists with a mission to simplify geospatial data."
  stakeholders={[
    {
      name: "Kornel Grunwald",
      position: "CEO & Co-founder",
      bio: "Kornel blends experience as a data analyst and technology leader to make geospatial insight accessible for all.",
      image: "/generated/image-a-friendly-professional-headshot-of-a-te.webp"
    },
    {
      name: "Szymon Moliński",
      position: "CTO & Co-founder",
      bio: "Szymon brings deep expertise in geo data pipelines, empowering teams with simple, powerful location intelligence.",
      image: "/generated/image-a-friendly-professional-headshot-of-a-te.webp"
    }
  ]}
/>




<!-- CTA Section -->
<CallToAction
  title="Help shape the future of location intelligence"
  subtitle="Join the team building Google Maps for agents"
  description="At Proximity, we’re making geospatial data intuitive—and we want teammates who thrive on curiosity, play, and solving hard problems for real users. Whether your background is in data, engineering, or creative technology, your work will help thousands of analysts do more with less complexity. If that sounds exciting, we’d love to meet you."
  imageSrc="/generated/image-a-cheerful-and-diverse-team-of-professio.webp"
  callsToAction={[
    { href: '/careers', label: 'Apply now', variant: 'primary' },
    { href: '/contact', label: 'Connect with us', variant: 'secondary' }
  ]}
/>
