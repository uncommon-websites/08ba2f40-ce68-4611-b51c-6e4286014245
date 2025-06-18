<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Button from "$lib/components/ui/Button.svelte";
	import AnimateText from "$lib/components/animation/AnimateText.svelte";

	type Props = {
		title: string;
		subtitle: string;
		callsToAction?: Array<{
			href: string;
			label: string;
			variant?: 'primary' | 'secondary';
		}>;
	};

	let { title, subtitle, callsToAction = [] }: Props = $props();

	let globeElement: HTMLDivElement;
	let animationId: number;
	let rotation = 0;
	let isHovering = false;

	// Simplified, elegant globe paths representing major continents
	const continentPaths = [
		// North America
		"M 180,140 Q 200,120 240,130 Q 280,140 300,160 Q 290,180 260,190 Q 220,185 180,170 Z",
		// Europe & Asia
		"M 320,130 Q 360,125 420,135 Q 480,145 520,160 Q 510,175 480,180 Q 440,175 400,170 Q 360,165 320,155 Z",
		// Africa
		"M 340,180 Q 360,175 380,185 Q 390,210 385,240 Q 375,265 360,275 Q 345,270 340,245 Q 335,215 340,195 Z",
		// South America
		"M 220,200 Q 240,195 260,205 Q 270,230 265,260 Q 255,285 240,295 Q 225,290 220,265 Q 215,235 220,215 Z",
		// Australia
		"M 460,260 Q 480,255 500,265 Q 505,275 500,285 Q 480,290 460,285 Q 455,275 460,270 Z"
	];

	onMount(() => {
		if (!browser) return;

		const animate = () => {
			animationId = requestAnimationFrame(animate);
			
			if (!isHovering) {
				rotation += 0.3;
				if (globeElement) {
					globeElement.style.transform = `rotateY(${rotation}deg)`;
				}
			}
		};

		animate();

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});

	function handleMouseEnter() {
		isHovering = true;
	}

	function handleMouseLeave() {
		isHovering = false;
	}
</script>

<div class="bg-background">
	<header class="section-px container mx-auto grid items-center gap-16 py-12 pt-24 xl:grid-cols-[1fr_auto]" data-enter-container>
		<!-- Content -->
		<div class="grid gap-6">
			<h1 class="text-display w-full" data-enter>
				<span class="block"><AnimateText text={title} /></span>
				<span class="text-emphasis-dim block"><AnimateText text={subtitle} /></span>
			</h1>
		</div>

		<!-- CTA Buttons -->
		{#if callsToAction.length > 0}
			<div class="flex gap-4" data-enter>
				{#each callsToAction as cta, index}
					<Button
						href={cta.href}
						size="lg"
						variant={index % 2 === 0 ? "primary" : "secondary"}
						class="max-lg:hidden"
					>
						{cta.label}
					</Button>
					<Button
						href={cta.href}
						size="md"
						variant={index % 2 === 0 ? "primary" : "secondary"}
						class="lg:hidden"
					>
						{cta.label}
					</Button>
				{/each}
			</div>
		{/if}
	</header>

	<!-- Globe Visualization -->
	<div class="section-px container mx-auto pb-12" data-enter>
		<div class="flex justify-center">
			<div 
				class="globe-container relative"
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
				role="img"
				aria-label="Interactive globe showing global deployment capabilities"
			>
				<div 
					bind:this={globeElement}
					class="globe-sphere"
					style="transform: rotateY({rotation}deg);"
				>
					<!-- Globe base with subtle gradient -->
					<div class="globe-base"></div>
					
					<!-- Continent outlines -->
					<svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400">
						<defs>
							<radialGradient id="sphereGradient" cx="0.3" cy="0.3">
								<stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
								<stop offset="70%" stop-color="rgba(255,255,255,0.2)" />
								<stop offset="100%" stop-color="rgba(0,0,0,0.1)" />
							</radialGradient>
						</defs>
						
						<!-- Continents -->
						{#each continentPaths as path}
							<path 
								d={path} 
								fill="var(--color-primary)" 
								fill-opacity="0.15"
								stroke="var(--color-primary)" 
								stroke-width="1" 
								stroke-opacity="0.4"
							/>
						{/each}
						
						<!-- Subtle grid lines -->
						<g stroke="var(--color-border)" stroke-width="0.5" opacity="0.2">
							<!-- Latitude lines -->
							<line x1="0" y1="100" x2="600" y2="100" />
							<line x1="0" y1="200" x2="600" y2="200" />
							<line x1="0" y1="300" x2="600" y2="300" />
							<!-- Longitude lines -->
							<line x1="150" y1="0" x2="150" y2="400" />
							<line x1="300" y1="0" x2="300" y2="400" />
							<line x1="450" y1="0" x2="450" y2="400" />
						</g>

						<!-- Agent deployment points -->
						<g class="agent-points">
							<circle cx="200" cy="150" r="3" fill="var(--color-primary)" opacity="0.8">
								<animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
							</circle>
							<circle cx="380" cy="140" r="3" fill="var(--color-primary)" opacity="0.6">
								<animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
							</circle>
							<circle cx="250" cy="220" r="3" fill="var(--color-primary)" opacity="0.7">
								<animate attributeName="opacity" values="0.7;0.25;0.7" dur="3s" repeatCount="indefinite" />
							</circle>
							<circle cx="480" cy="270" r="3" fill="var(--color-primary)" opacity="0.5">
								<animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.2s" repeatCount="indefinite" />
							</circle>
						</g>
					</svg>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.globe-container {
		width: 500px;
		height: 350px;
		perspective: 1000px;
	}

	.globe-sphere {
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.3s ease-out;
	}

	.globe-base {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: linear-gradient(135deg, 
			hsl(var(--background)) 0%, 
			hsl(var(--muted)) 50%, 
			hsl(var(--background)) 100%);
		border: 1px solid hsl(var(--border));
		box-shadow: 
			inset -20px -20px 40px hsl(var(--muted) / 0.3),
			inset 20px 20px 40px hsl(var(--background) / 0.8),
			0 10px 30px hsl(var(--foreground) / 0.1);
		position: relative;
		overflow: hidden;
	}

	.globe-base::before {
		content: '';
		position: absolute;
		top: 20%;
		left: 25%;
		width: 50%;
		height: 50%;
		border-radius: 50%;
		background: radial-gradient(circle at 40% 40%, 
			hsl(var(--background) / 0.8), 
			transparent 60%);
		pointer-events: none;
	}

	.globe-container:hover .globe-sphere {
		transform: rotateY(0deg) rotateX(-5deg);
	}

	@media (max-width: 768px) {
		.globe-container {
			width: 350px;
			height: 250px;
		}
	}

	@media (max-width: 480px) {
		.globe-container {
			width: 280px;
			height: 200px;
		}
	}
</style>