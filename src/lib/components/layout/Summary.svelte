<!--
@component
    Use this component to showcase the main #1 benefit of a product or service in a clear and concise manner.

    Usage:
    ```html
    <Summary
      title="A clear value proposition"
      text="This component showcases your most important benefit with a smooth animation effect as users scroll"
    />
    ```

    Props:
    - `title`: A summary hint about the benefit (sentence case)
    - `text`: Main benefit statement, concise and impactful
-->

<script lang="ts">
	// Utils
	import { scroll, animate, stagger } from "motion";
	import { onMount } from "svelte";

	// Props
	const {
		title,
		text,
		...rest
	}: {
		title?: string;
		text: string;
	} = $props();

	// State
	let segments = $derived(text.split("\n\n"));
	let containerElement: HTMLDivElement;

	onMount(() => {
		if (!containerElement) return;
		if (window.self !== window.top) return;

		// Get all word elements as an array
		const wordElements = Array.from(containerElement.querySelectorAll(".word"));

		const sequence = [
			[
				wordElements,
				{
					opacity: [0, 0, 1],
					y: ["1em", 0],
					filter: ["blur(12px)", "blur(8px) brightness(250%)", "blur(0px)"]
				},
				{
					at: "0",
					delay: stagger(0.015),
					ease: "easeInOut"
				}
			]
		];

		scroll(animate(sequence), {
			target: containerElement,
			offset: ["start end", "center center"]
		});
	});
</script>

<div
	class="section-my section-px relative container mx-auto flex flex-col items-start gap-8 text-pretty lg:grid xl:flex-row"
	bind:this={containerElement}
	class:lg:grid-cols-[1fr_2fr]={!!title}
	style="background: linear-gradient(180deg, oklch(0.99 0.005 10) 0%, oklch(0.97 0.01 15) 50%, oklch(0.99 0.005 10) 100%)"
	{...rest}
>
	{#if title}
		<p class="text-emphasis-dim word">{title}</p>
	{/if}

	<div class="text-title1 container-sm gap relative mx-auto grid">
		{#each segments as paragraph, i}
			<p class="mb-[1.5em] last:mb-0">
				{#each paragraph.split(" ").filter(Boolean) as word}
					<span class="word relative inline-block transition duration-150 ease-out">{word}</span
					>{" "}
				{/each}
			</p>
		{/each}
	</div>
</div>
