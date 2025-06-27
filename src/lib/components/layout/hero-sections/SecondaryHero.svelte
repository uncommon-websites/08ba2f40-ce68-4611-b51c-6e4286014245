<script lang="ts">
	import SectionHeader from "$lib/components/layout/SectionHeader.svelte";

	let {
		title,
		subtitle,
		imageSrc = "https://source.unsplash.com/random/?people",
		...rest
	}: {
		title: string;
		subtitle: string;
		imageSrc: string;
	} = $props();
</script>

<header class="relative overflow-hidden border-b border-white/20" style="background: linear-gradient(135deg, oklch(0.98 0.01 15) 0%, oklch(0.95 0.02 20) 25%, oklch(0.92 0.03 25) 50%, oklch(0.89 0.04 30) 75%, oklch(0.86 0.05 35) 100%)" {...rest}>
	<div class="text-title3 section-px section-py container mx-auto grid gap-16 gap-y-0">
		<SectionHeader {title} {subtitle} size="lg" />
		<div class="aspect-video overflow-clip rounded-xl relative" style="background: linear-gradient(45deg, oklch(0.95 0.02 20) 0%, oklch(0.92 0.03 25) 100%)">
			<!-- Gradient overlay inspired by the moodboard -->
			<div class="absolute inset-0 z-10 rounded-xl" 
				 style="background: linear-gradient(45deg, oklch(0.85 0.05 35 / 0.2) 0%, oklch(0.88 0.04 30 / 0.1) 50%, oklch(0.92 0.02 20 / 0.05) 100%)"></div>
			<img
				class="h-full w-full object-cover filter brightness-110 contrast-105"
				src={imageSrc}
				alt="Diverse group of people collaborating"
			/>
		</div>
	</div>
</header>
