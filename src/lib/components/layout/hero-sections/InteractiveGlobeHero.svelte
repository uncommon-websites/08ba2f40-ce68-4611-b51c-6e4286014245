<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

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

	let globeContainer: HTMLDivElement;
	let globeElement: HTMLDivElement;
	let animationId: number;
	let isHovering = false;
	let rotation = 0;
	let mousePosition = { x: 0, y: 0 };
	let showCrosshairs = false;
	let showMarker = false;
	let showPointCloud = false;
	let markerPosition = { x: 0, y: 0 };
	let coordinates = { lat: 0, lng: 0 };
	let coordinateLabel: HTMLDivElement;

	// Generate more realistic coastline paths for globe representation
	const coastlinePaths = [
		// North America outline
		"M 100,180 Q 120,160 140,180 Q 160,200 180,180 Q 200,160 220,180 Q 240,200 260,180",
		// Europe/Asia outline  
		"M 280,160 Q 300,140 320,160 Q 340,180 360,160 Q 380,140 400,160 Q 420,180 440,160",
		// Africa outline
		"M 280,200 Q 300,220 320,240 Q 340,260 360,240 Q 380,220 400,240",
		// South America outline
		"M 160,240 Q 180,260 200,280 Q 220,300 240,280 Q 260,260 280,280",
		// Australia outline
		"M 380,280 Q 400,300 420,280 Q 440,300 460,280",
		// Additional coastline details
		"M 120,120 Q 140,100 160,120 Q 180,140 200,120", // Greenland/Arctic
		"M 200,320 Q 220,340 240,320 Q 260,340 280,320", // Antarctica
		"M 320,200 Q 340,220 360,200 Q 380,220 400,200", // Asia detail
	];

	onMount(() => {
		if (!browser) return;

		const animate = () => {
			animationId = requestAnimationFrame(animate);

			// Auto-rotate when not hovering
			if (!isHovering) {
				rotation += 0.5;
				if (globeElement) {
					globeElement.style.transform = `rotateY(${rotation}deg)`;
				}
			}
		};

		animate();

		// Cleanup
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});

	function handleMouseMove(event: MouseEvent) {
		if (!globeContainer) return;

		const rect = globeContainer.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const radius = Math.min(centerX, centerY) * 0.8;

		const mouseX = event.clientX - rect.left - centerX;
		const mouseY = event.clientY - rect.top - centerY;
		const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

		if (distance <= radius) {
			isHovering = true;
			showCrosshairs = true;
			showMarker = true;
			showPointCloud = true;

			// Calculate position on sphere
			const x = mouseX / radius;
			const y = -mouseY / radius;
			const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));

			// Convert to lat/lng
			const lat = Math.asin(y) * (180 / Math.PI);
			const lng = Math.atan2(x, z) * (180 / Math.PI);

			coordinates = { lat, lng };
			markerPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };

			// Update coordinate label
			updateCoordinateLabel(event.clientX, event.clientY, lat, lng);
		} else {
			isHovering = false;
			showCrosshairs = false;
			showMarker = false;
			showPointCloud = false;
			if (coordinateLabel) {
				coordinateLabel.style.display = 'none';
			}
		}
	}

	function handleMouseLeave() {
		isHovering = false;
		showCrosshairs = false;
		showMarker = false;
		showPointCloud = false;
		if (coordinateLabel) {
			coordinateLabel.style.display = 'none';
		}
	}

	function updateCoordinateLabel(x: number, y: number, lat: number, lng: number) {
		if (!coordinateLabel) return;
		
		coordinateLabel.style.display = 'block';
		coordinateLabel.style.left = `${x + 10}px`;
		coordinateLabel.style.top = `${y - 30}px`;
		coordinateLabel.textContent = `Lat: ${lat >= 0 ? '+' : ''}${lat.toFixed(3)}, Lng: ${lng >= 0 ? '+' : ''}${lng.toFixed(3)}`;
	}

	// Generate random points for point cloud (≈5000 points as requested)
	function generatePointCloudPoints() {
		const points = [];
		const pointCount = Math.min(5000, 200); // Limit for performance, but visually dense
		for (let i = 0; i < pointCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const radius = 15 + Math.random() * 60; // Wider spread
			const x = markerPosition.x + Math.cos(angle) * radius;
			const y = markerPosition.y + Math.sin(angle) * radius;
			
			// Only add points that are within reasonable bounds
			if (x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight) {
				points.push({ 
					x, 
					y, 
					opacity: 0.2 + Math.random() * 0.6,
					size: 0.5 + Math.random() * 1.5 // Variable sizes
				});
			}
		}
		return points;
	}

	let pointCloudPoints = $derived(showPointCloud ? generatePointCloudPoints() : []);
</script>

<section class="relative h-screen w-full overflow-hidden bg-white">
	<!-- 3D Globe Container -->
	<div 
		bind:this={globeContainer} 
		class="absolute inset-0 flex items-center justify-center cursor-crosshair"
		role="img"
		aria-label="Interactive globe"
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
	>
		<!-- Globe -->
		<div 
			bind:this={globeElement}
			class="globe-sphere relative"
			style="transform: rotateY({rotation}deg);"
		>
			<!-- Globe base -->
			<div class="globe-base"></div>
			
			<!-- Coastlines (thin black strokes only) -->
			<svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
				{#each coastlinePaths as path}
					<path d={path} stroke="black" stroke-width="1.5" fill="none" opacity="0.8" />
				{/each}
				
				<!-- Add some longitude/latitude grid lines for more globe-like appearance -->
				<g opacity="0.2">
					<line x1="0" y1="125" x2="500" y2="125" stroke="black" stroke-width="0.5" />
					<line x1="0" y1="250" x2="500" y2="250" stroke="black" stroke-width="0.5" />
					<line x1="0" y1="375" x2="500" y2="375" stroke="black" stroke-width="0.5" />
					<line x1="125" y1="0" x2="125" y2="500" stroke="black" stroke-width="0.5" />
					<line x1="250" y1="0" x2="250" y2="500" stroke="black" stroke-width="0.5" />
					<line x1="375" y1="0" x2="375" y2="500" stroke="black" stroke-width="0.5" />
				</g>
			</svg>
		</div>

		<!-- Crosshairs (pale-grey full-width/height lines) -->
		{#if showCrosshairs}
			<div class="absolute inset-0 pointer-events-none">
				<!-- Horizontal latitude line (full-width) -->
				<div 
					class="absolute w-full h-px bg-gray-300 opacity-70"
					style="top: {markerPosition.y}px;"
				></div>
				<!-- Vertical longitude line (full-height) -->
				<div 
					class="absolute h-full w-px bg-gray-300 opacity-70"
					style="left: {markerPosition.x}px;"
				></div>
			</div>
		{/if}

		<!-- Orange marker -->
		{#if showMarker}
			<div 
				class="absolute w-4 h-4 bg-orange-500 rounded-full pointer-events-none transform -translate-x-2 -translate-y-2 z-10"
				style="left: {markerPosition.x}px; top: {markerPosition.y}px;"
			></div>
		{/if}

		<!-- Point cloud (≈5000 translucent red points) -->
		{#if showPointCloud}
			{#each pointCloudPoints as point}
				<div 
					class="absolute bg-red-500 rounded-full pointer-events-none"
					style="
						left: {point.x}px; 
						top: {point.y}px; 
						opacity: {point.opacity};
						width: {point.size}px;
						height: {point.size}px;
					"
				></div>
			{/each}
		{/if}
	</div>

	<!-- Coordinate Label -->
	<div
		bind:this={coordinateLabel}
		class="pointer-events-none absolute z-20 hidden rounded bg-black/80 px-2 py-1 text-sm text-white"
	></div>

	<!-- Content Overlay -->
	<div class="relative z-10 flex h-full flex-col items-center justify-center text-center pointer-events-none">
		<div class="mx-auto max-w-4xl px-6">
			<h1 class="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
				{title}
			</h1>
			<p class="mb-8 text-xl text-gray-600 sm:text-2xl">
				{subtitle}
			</p>
			{#if callsToAction.length > 0}
				<div class="flex flex-col gap-4 sm:flex-row sm:justify-center pointer-events-auto">
					{#each callsToAction as cta}
						<a
							href={cta.href}
							class="inline-flex items-center justify-center rounded-md px-8 py-3 text-base font-medium transition-colors
								{cta.variant === 'secondary'
								? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
								: 'bg-gray-900 text-white hover:bg-gray-800'}"
						>
							{cta.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.globe-sphere {
		width: 400px;
		height: 400px;
		transform-style: preserve-3d;
		transition: transform 0.1s ease-out;
	}

	.globe-base {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: white;
		border: none;
		box-shadow: 
			inset -30px -30px 60px rgba(0, 0, 0, 0.15),
			inset 30px 30px 60px rgba(255, 255, 255, 0.9),
			0 0 50px rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	.globe-base::before {
		content: '';
		position: absolute;
		top: 15%;
		left: 20%;
		width: 60%;
		height: 60%;
		border-radius: 50%;
		background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.6), transparent 60%);
		pointer-events: none;
	}

	.globe-base::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, transparent 40%, rgba(0, 0, 0, 0.1) 100%);
		pointer-events: none;
	}

	@media (max-width: 768px) {
		.globe-sphere {
			width: 300px;
			height: 300px;
		}
	}
</style>