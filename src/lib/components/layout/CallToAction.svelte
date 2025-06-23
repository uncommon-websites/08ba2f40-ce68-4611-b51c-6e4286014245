<!--
    @component
    A call-to-action component that attracts attention and encourages user engagement.

    Usage:
    ```html
    <CallToAction
      title="Get started today"
      subtitle="Join now"
      description="Ready to experience the difference? Join our community of satisfied customers and see how our solution can transform your workflow."
      image="/path/to/image.jpg"
      callsToAction={[
        {
          href: "/get-started",
          label: "Get Started",
          variant: "primary"
        },
        {
          href: "/contact",
          label: "Talk to Sales",
          variant: "secondary"
        }
      ]}
    />
    ```

    Props:
    - `title`: The main heading text (string)
    - `subtitle`: Secondary heading text (string)
    - `description`: Detailed information about the offer (string)
    - `callsToAction`: Array of CTA objects with href, label, and optional variant properties (CTA[])
    - `imageSrc`: portrait of the company's customer smiling at the camera.
-->

<script lang="ts">
	// Types
	import type { ComponentProps } from "svelte";

	// Components
	import Button from "../ui/Button.svelte";
	import AnimateText from "../animation/AnimateText.svelte";
	import { cta } from "$lib/navigation";

	// Types
	type CTA = {
		href: string;
		label: string;
		variant?: ComponentProps<typeof Button>["variant"];
	};

	// Props
	const {
		title = "Get started today",
		subtitle = "Join now",
		description = "Ready to experience the difference? Join our community of satisfied customers and see how our solution can transform your workflow. ",
		imageSrc = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
		callsToAction = [cta],
		...rest
	}: {
		title?: string;
		subtitle?: string;
		description?: string;
		imageSrc?: string;
		callsToAction?: CTA[];
	} = $props();
</script>

<div class="" {...rest}>
	<section class="section-px section-py container mx-auto">
		<div
			class="bg-card border-border grid content-start items-center justify-between gap-(--gap) rounded-(--radius) border p-(--gap) text-balance [--gap:--spacing(8)] [--inner-radius:calc(var(--radius)-var(--gap))] [--radius:var(--radius-xl)] lg:grid-cols-[2fr_1fr]"
		>
			<div class="items-between grid h-full content-between gap-16">
				<h2 class="text-title1 mb-3 flex flex-col">
					<span><AnimateText text={title} /></span>
					<span class="text-emphasis-low"><AnimateText text={subtitle} /></span>
				</h2>
				<div class="flex flex-col items-start justify-start gap-7">
					<p class="text-headline text-emphasis-low">
						{description}
					</p>
					<div class="flex w-full flex-col gap-2 md:flex-row md:flex-wrap">
						{#each callsToAction as cta}
							<Button class="w-full md:w-auto" href={cta.href} variant={cta.variant || "primary"}
								>{cta.label}</Button
							>
						{/each}
					</div>
				</div>
			</div>
			<div class="hidden lg:block relative overflow-hidden">
				<img
					src="/generated/image-a-group-of-people-engaged-in-a-focused-d.webp"
					alt="Abstract 80s sci-fi space visualization"
					class="aspect-[4/5] size-full max-h-full w-full rounded-[calc(max(var(--inner-radius),.25rem))] object-cover filter contrast-125 saturate-150 hue-rotate-180"
				/>
				<div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 mix-blend-overlay rounded-[calc(max(var(--inner-radius),.25rem))]"></div>
				<div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(0,0,0,0.3)_100%)] rounded-[calc(max(var(--inner-radius),.25rem))]"></div>
			</div>
		</div>
	</section>
</div>
