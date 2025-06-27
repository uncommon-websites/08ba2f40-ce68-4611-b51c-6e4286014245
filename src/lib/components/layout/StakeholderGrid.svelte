<script lang="ts">
	import SectionHeader from "$lib/components/layout/SectionHeader.svelte";
	import Button from "$lib/components/ui/Button.svelte";
	import { animate, stagger } from "motion";
	import { onMount } from "svelte";

	// Types
	type Stakeholder = {
		name: string;
		position?: string;
		bio?: string;
		image: string;
	};

	// Props
	const {
		title,
		stakeholderType = "team",
		subtitle,
		stakeholders
	}: {
		stakeholders: Stakeholder[];
		title: string;
		subtitle: string;
		stakeholderType?: "team" | "investor";
	} = $props();

	let cards: HTMLElement[] = $state([]);

	onMount(() => {
		if (window.self !== window.top) return;
		animate(
			cards,
			{
				y: ["1.5rem", 0],
				filter: ["blur(2px)", "blur(0px)"],
				opacity: [0, 1]
			},
			{
				duration: 0.3,
				ease: "easeOut",
				delay: stagger(0.1, {
					ease: "easeInOut"
				})
			}
		);
	});
</script>

<section class="relative overflow-hidden" style="background: linear-gradient(135deg, oklch(0.97 0.01 15) 0%, oklch(0.95 0.015 20) 25%, oklch(0.93 0.02 25) 50%, oklch(0.95 0.015 20) 75%, oklch(0.97 0.01 15) 100%)">
	<div class="section-py section-px container mx-auto grid [--gap:--spacing(4)]">
		<SectionHeader {title} {subtitle} />

		<div
			class="grid grid-cols-1 gap-(--gap) {stakeholders.length === 1
				? 'md:grid-cols-3'
				: 'md:grid-cols-2 lg:grid-cols-4'}"
		>
			{#snippet card(
				{
					name,
					position,
					image,
					type = "team"
				}: {
					name: string;
					position?: string;
					image: string;
					type?: "team" | "join";
				},
				index: number
			)}
				<div
					bind:this={cards[index]}
					class={[
						"card opacity-0",
						"bg-cover",
						"relative isolate grid aspect-[4/5] content-end items-end gap-10 overflow-hidden rounded-(--radius) bg-cover p-(--gap) [--inner-radius:calc(var(--radius)-var(--gap))] ",
						type === "join" ? "" : "backdrop-blur-sm"
					]}
					style={type === "join" 
						? "background: linear-gradient(135deg, oklch(0.9 0.03 30) 0%, oklch(0.85 0.04 35) 50%, oklch(0.8 0.05 40) 100%)" 
						: ""}
					style={type === "join"
						? ""
						: stakeholderType === "investor"
							? ""
							: `background-image: url('${image}'); background-position: center; background-size: cover;`}
				>
					{#if type === "team" && stakeholderType === "team"}
						<div
							class="absolute top-0 right-0 bottom-0 left-0"
							style="background: linear-gradient(to bottom, oklch(0.95 0.02 20 / 0) 0%, oklch(0.9 0.03 25 / 0.1) 50%, oklch(0.8 0.05 35 / 0.4) 100%)"
						>
							<div class="absolute right-0 bottom-0 left-0 h-[25%]" style="background: linear-gradient(to bottom, transparent 0%, oklch(0.75 0.06 40 / 0.6) 100%)"></div>
						</div>
					{/if}

					{#if stakeholderType === "investor" && image}
						<img
							src={image}
							alt=""
							class="absolute top-1/2 left-1/2 size-[50%] max-h-10 -translate-x-1/2 -translate-y-1/2 object-contain opacity-70 saturate-0 dark:invert"
						/>
					{/if}

					<div
						class="text-caption z-10 {stakeholderType !== 'team'
							? 'text-gray-700 dark:text-gray-50'
							: 'text-white'}"
					>
						<div class={type === "join" ? "grid grid-cols-2 items-center" : ""}>
							<div>
								<div>{name}</div>
								<div class="opacity-70">{position}</div>
							</div>
							{#if type === "join"}
								<div class="justify-self-end">
									<Button href="/careers" variant="secondary" size="sm">Join us</Button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/snippet}

			{#each stakeholders as member, index}
				{@render card(member, index)}
			{/each}

			{#if stakeholderType === "team"}
				{@render card(
					{
						name: "You?",
						position: "Join us",
						type: "join"
					},
					stakeholders.length
				)}
			{/if}
		</div>
	</div>
</section>
