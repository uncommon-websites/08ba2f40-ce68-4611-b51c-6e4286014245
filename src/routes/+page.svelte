<script lang="ts">
	import DocumentationLayout from "$lib/components/layout/DocumentationLayout.svelte";
	import DocumentationContent from "$lib/components/layout/DocumentationContent.svelte";

	// Define the navigation sections for the sidebar
	const sections = [
		{
			id: "introduction",
			title: "Introduction",
			icon: "↓"
		},
		{
			id: "why-switch",
			title: "Why do teams switch to Proximity?",
			icon: "↓"
		},
		{
			id: "who-else",
			title: "Who else is switching?",
			icon: "↓"
		},
		{
			id: "how-it-works",
			title: "How does the switching process work?",
			icon: "↓"
		}
	];
</script>

<DocumentationLayout
	title="Why and how data teams switch to Proximity"
	sections={sections}
>
	<DocumentationContent />
</DocumentationLayout>