<script>
	import { geoMercator, geoGraticule10, geoPath } from "d3-geo";
	import { json } from "d3-fetch";
	import * as topojson from "topojson-client";

	let land = $state();
	let borders = $state();
	let outline = $state();

	// Specify the chart's dimensions.
	let width = $state(0);
	let height = $state(0);

	let graticule = $state();
	// Prepare Projection.
	const projection = geoMercator();
	// Many other projections are available.
	// See them here: https://github.com/d3/d3-geo#projections.

	// Prepare Graticule: a grid of meridians and parallels
	// for showing projection distortion.

	// Prepare Path-Generator: given a GeoJSON geometry or
	// feature object, it generates an SVG path data string.
	const path = geoPath(projection);

	// Land-based locations for moving dots
	const landLocations = [
		{ name: "New York", coords: [-74.006, 40.7128] },
		{ name: "London", coords: [-0.1276, 51.5074] },
		{ name: "Tokyo", coords: [139.6917, 35.6895] },
		{ name: "Sydney", coords: [151.2093, -33.8688] },
		{ name: "São Paulo", coords: [-46.6333, -23.5505] },
		{ name: "Mumbai", coords: [72.8777, 19.076] },
		{ name: "Lagos", coords: [3.3792, 6.5244] },
		{ name: "Berlin", coords: [13.405, 52.52] },
		{ name: "Cairo", coords: [31.2357, 30.0444] },
		{ name: "Moscow", coords: [37.6173, 55.7558] },
		{ name: "Beijing", coords: [116.4074, 39.9042] },
		{ name: "Mexico City", coords: [-99.1332, 19.4326] },
		{ name: "Buenos Aires", coords: [-58.3816, -34.6037] },
		{ name: "Cape Town", coords: [18.4241, -33.9249] },
		{ name: "Bangkok", coords: [100.5018, 13.7563] },
		{ name: "Istanbul", coords: [28.9784, 41.0082] }
	];

	let movingDots = $state([]);
	let animationId = $state(null);
	let hexGrid = $state([]);

	// Generate hexagonal grid points for tech pattern
	function generateHexGrid() {
		const hexSize = 20;
		const grid = [];
		
		for (let row = 0; row < Math.ceil(height / (hexSize * 1.5)); row++) {
			for (let col = 0; col < Math.ceil(width / (hexSize * Math.sqrt(3))); col++) {
				const x = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2;
				const y = row * hexSize * 1.5;
				
				if (x >= 0 && x <= width && y >= 0 && y <= height) {
					grid.push({
						x,
						y,
						id: `hex-${row}-${col}`,
						flickerDelay: Math.random() * 5000,
						flickerDuration: 100 + Math.random() * 200,
						isActive: Math.random() > 0.95 // Only 5% of hexes are active
					});
				}
			}
		}
		
		return grid;
	}

	// Create pulsing dots at fixed locations
	function createPulsingDots() {
		const dots = [];
		const numDots = 8;

		for (let i = 0; i < numDots; i++) {
			const locationIndex = Math.floor(Math.random() * landLocations.length);
			const location = landLocations[locationIndex];
			const [x, y] = projection(location.coords);

			dots.push({
				id: i,
				x,
				y,
				location,
				isVisible: true,
				pulsePhase: Math.random() * Math.PI * 2,
				pulseSpeed: 0.05 + Math.random() * 0.03,
				visibilityDuration: 3000 + Math.random() * 2000, // 3-5 seconds visible
				invisibilityDuration: 1000 + Math.random() * 1000, // 1-2 seconds invisible
				lastToggleTime: Date.now() + Math.random() * 5000,
				scale: 1
			});
		}

		return dots;
	}

	// Animation function for pulsing dots
	function animateDots() {
		const currentTime = Date.now();
		
		movingDots = movingDots.map((dot) => {
			// Update pulse phase
			dot.pulsePhase += dot.pulseSpeed;
			
			// Calculate pulse scale (1.0 to 1.3)
			dot.scale = 1 + 0.3 * Math.sin(dot.pulsePhase);

			// Handle visibility toggling
			const timeSinceToggle = currentTime - dot.lastToggleTime;
			const currentDuration = dot.isVisible ? dot.visibilityDuration : dot.invisibilityDuration;
			
			if (timeSinceToggle > currentDuration) {
				dot.isVisible = !dot.isVisible;
				dot.lastToggleTime = currentTime;
				
				// When becoming invisible, pick a new random location for next appearance
				if (!dot.isVisible) {
					const newLocationIndex = Math.floor(Math.random() * landLocations.length);
					const newLocation = landLocations[newLocationIndex];
					const [newX, newY] = projection(newLocation.coords);
					dot.x = newX;
					dot.y = newY;
					dot.location = newLocation;
				}
			}

			return dot;
		});

		// Update hex grid flickering
		hexGrid = hexGrid.map(hex => {
			if (hex.isActive) {
				const shouldFlicker = Math.random() < 0.002;
				if (shouldFlicker) {
					hex.flickerTime = currentTime + hex.flickerDuration;
				}
				hex.active = currentTime < hex.flickerTime;
			}
			return hex;
		});

		animationId = requestAnimationFrame(animateDots);
	}

	$effect(() => {
		// Update projection when dimensions change - make map bigger to fill viewport
		projection.fitSize([width, height], { type: "Sphere" });
		graticule = geoGraticule10();

		// Prepare the outline (see https://github.com/d3/d3-geo#_path).
		// "The type Sphere is also supported, which is useful for
		// rendering the outline of the globe; a sphere has no coordinates."
		outline = { type: "Sphere" };

		// Load geo data and initialize moving dots
		json(
			// Load the geo-data from npm.
			// More info here: https://github.com/topojson/world-atlas.
			// And here: https://www.npmjs.com/package/world-atlas.
			"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
		).then((world) => {
			// then pull out the land-shapes
			land = topojson.feature(world, world.objects.land);
			// and border-shapes
			borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

			// Initialize pulsing dots and hex grid after projection is set up
			if (width > 0 && height > 0) {
				movingDots = createPulsingDots();
				hexGrid = generateHexGrid();

				// Start animation after a brief delay
				setTimeout(() => {
					if (animationId) {
						cancelAnimationFrame(animationId);
					}
					animateDots();
				}, 1000);
			}
		});

		// Cleanup animation on component destroy
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div class="h-screen w-full" bind:clientWidth={width} bind:clientHeight={height}>
	<svg viewBox="0 0 {width} {height}" class="h-full w-full" preserveAspectRatio="xMidYMid meet">
		<!-- <path d={path(outline)} fill="#fff" /> -->
		<!-- <path d={path(graticule)} stroke="var(--color-gray-900)" fill="none" /> -->
		<path d={path(land)} fill="var(--color-gray-100)" />
		<path d={path(borders)} fill="none" stroke="var(--color-gray-200)" />

		<!-- Hexagonal background grid -->
		{#each hexGrid as hex}
			{#if hex.isActive && hex.active}
				<polygon
					points={`${hex.x},${hex.y-8} ${hex.x+7},${hex.y-4} ${hex.x+7},${hex.y+4} ${hex.x},${hex.y+8} ${hex.x-7},${hex.y+4} ${hex.x-7},${hex.y-4}`}
					fill="none"
					stroke="var(--color-primary-400)"
					stroke-width="0.5"
					opacity="0.2"
					class="hex-grid"
				/>
			{/if}
		{/each}

		<!-- Pulsing dots at fixed locations -->
		{#each movingDots as dot}
			{#if dot.isVisible}
				<g class="pulsing-dot" transform="translate({dot.x}, {dot.y}) scale({dot.scale})">
					<!-- Outer pulse ring -->
					<circle
						cx="0"
						cy="0"
						r="8"
						fill="none"
						stroke="var(--color-primary-400)"
						stroke-width="1"
						opacity="0.4"
						class="pulse-ring"
					/>
					
					<!-- Main dot -->
					<circle
						cx="0"
						cy="0"
						r="4"
						fill="var(--color-primary-500)"
						class="dot-core"
					/>
					
					<!-- Inner glow -->
					<circle
						cx="0"
						cy="0"
						r="2"
						fill="var(--color-primary-300)"
						opacity="0.8"
						class="dot-glow"
					/>
				</g>
			{/if}
		{/each}
	</svg>
</div>

<style>
	.pulsing-dot {
		pointer-events: none;
	}

	.hex-grid {
		animation: hex-flicker 0.15s ease-in-out;
	}

	.pulse-ring {
		animation: pulse-ring 2s ease-in-out infinite;
	}

	.dot-core {
		filter: drop-shadow(0 0 4px var(--color-primary-500));
		animation: dot-pulse 2s ease-in-out infinite;
	}

	.dot-glow {
		animation: glow-pulse 2s ease-in-out infinite;
	}

	@keyframes hex-flicker {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.4;
		}
		100% {
			opacity: 0.2;
		}
	}

	@keyframes pulse-ring {
		0% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 0.1;
			transform: scale(1.5);
		}
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
	}

	@keyframes dot-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	@keyframes glow-pulse {
		0%,
		100% {
			opacity: 0.8;
			transform: scale(1);
		}
		50% {
			opacity: 0.4;
			transform: scale(1.2);
		}
	}
</style>
