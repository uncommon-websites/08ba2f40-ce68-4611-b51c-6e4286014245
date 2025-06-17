<script lang="ts">
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

	// Prepare Path-Generator: given a GeoJSON geometry or
	// feature object, it generates an SVG path data string.
	const path = geoPath(projection);

	// Mouse tracking and map movement
	let mouseX = $state(0);
	let mouseY = $state(0);
	let mapOffsetX = $state(0);
	let animationFrameId: number | null = $state(null);
	let mapOffsetY = $state(0);
	let containerElement = $state(null);

	// Map bounds for constraint calculation
	let mapScale = $state(0);
	const baseMapWidth = 1000; // Approximate world map width at scale 1
	const baseMapHeight = 500; // Approximate world map height at scale 1

	// Land-based locations for pulsing dots - expanded list for better distribution
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
		{ name: "Istanbul", coords: [28.9784, 41.0082] },
		{ name: "Singapore", coords: [103.8198, 1.3521] },
		{ name: "Dubai", coords: [55.2708, 25.2048] },
		{ name: "Toronto", coords: [-79.3832, 43.6532] },
		{ name: "Seoul", coords: [126.9780, 37.5665] },
		{ name: "Paris", coords: [2.3522, 48.8566] },
		{ name: "Los Angeles", coords: [-118.2437, 34.0522] },
		{ name: "Chicago", coords: [-87.6298, 41.8781] },
		{ name: "Madrid", coords: [-3.7038, 40.4168] },
		{ name: "Rome", coords: [12.4964, 41.9028] },
		{ name: "Amsterdam", coords: [4.9041, 52.3676] },
		{ name: "Stockholm", coords: [18.0686, 59.3293] },
		{ name: "Helsinki", coords: [24.9384, 60.1699] },
		{ name: "Oslo", coords: [10.7522, 59.9139] },
		{ name: "Copenhagen", coords: [12.5683, 55.6761] },
		{ name: "Vienna", coords: [16.3738, 48.2082] },
		{ name: "Zurich", coords: [8.5417, 47.3769] },
		{ name: "Brussels", coords: [4.3517, 50.8503] },
		{ name: "Warsaw", coords: [21.0122, 52.2297] },
		{ name: "Prague", coords: [14.4378, 50.0755] },
		{ name: "Budapest", coords: [19.0402, 47.4979] },
		{ name: "Lisbon", coords: [-9.1393, 38.7223] },
		{ name: "Barcelona", coords: [2.1734, 41.3851] },
		{ name: "Milan", coords: [9.1900, 45.4642] },
		{ name: "Munich", coords: [11.5820, 48.1351] },
		{ name: "Frankfurt", coords: [8.6821, 50.1109] },
		{ name: "Hamburg", coords: [9.9937, 53.5511] },
		{ name: "Cologne", coords: [6.9603, 50.9375] },
		{ name: "Lyon", coords: [4.8357, 45.7640] },
		{ name: "Marseille", coords: [5.3698, 43.2965] },
		{ name: "Nice", coords: [7.2619, 43.7102] },
		{ name: "Geneva", coords: [6.1432, 46.2044] },
		{ name: "Bern", coords: [7.4474, 46.9480] },
		{ name: "Luxembourg", coords: [6.1296, 49.8153] },
		{ name: "Dublin", coords: [-6.2603, 53.3498] }
	];

	// Exactly 30 pulsing dots on land
	let pulsingDots = $state([]);
	let animationId = $state(null);

	// Create exactly 30 pulsing dots on land locations
	function createPulsingDots() {
		const dots = [];
		const numDots = 30; // Exactly 30 dots as requested

		for (let i = 0; i < numDots; i++) {
			// Randomly select a land location
			const locationIndex = Math.floor(Math.random() * landLocations.length);
			const location = landLocations[locationIndex];
			const [x, y] = projection(location.coords);

			dots.push({
				id: i,
				x,
				y,
				location,
				// Fade properties for subtle in/out transitions
				opacity: 0,
				targetOpacity: Math.random() > 0.5 ? 0.6 + Math.random() * 0.4 : 0, // Start some visible, some invisible
				fadeSpeed: 0.01 + Math.random() * 0.02, // Slow, subtle fade speed
				// Pulse properties for gentle pulsing effect
				pulsePhase: Math.random() * Math.PI * 2,
				pulseSpeed: 0.02 + Math.random() * 0.03, // Gentle pulse speed
				baseSize: 2 + Math.random() * 3, // Varied sizes
				pulseIntensity: 0.3 + Math.random() * 0.4, // Subtle pulse intensity
				// Timing for fade in/out cycles
				nextFadeToggle: Date.now() + Math.random() * 5000,
				visibleDuration: 3000 + Math.random() * 7000, // How long to stay visible
				invisibleDuration: 2000 + Math.random() * 5000, // How long to stay invisible
				isVisible: Math.random() > 0.5
			});
		}

		return dots;
	}

	// Animation function for pulsing dots
	function animateElements() {
		const currentTime = Date.now();

		// Animate the 30 pulsing dots with subtle fade in/out
		pulsingDots = pulsingDots.map((dot) => {
			// Update pulse phase for gentle pulsing
			dot.pulsePhase += dot.pulseSpeed;
			
			// Check if it's time to toggle visibility
			if (currentTime >= dot.nextFadeToggle) {
				dot.isVisible = !dot.isVisible;
				dot.targetOpacity = dot.isVisible ? (0.6 + Math.random() * 0.4) : 0;
				
				// Set next toggle time
				const duration = dot.isVisible ? dot.visibleDuration : dot.invisibleDuration;
				dot.nextFadeToggle = currentTime + duration;
				
				// When becoming invisible, optionally move to new location for variety
				if (!dot.isVisible && Math.random() > 0.7) {
					const newLocationIndex = Math.floor(Math.random() * landLocations.length);
					const newLocation = landLocations[newLocationIndex];
					const [newX, newY] = projection(newLocation.coords);
					dot.x = newX;
					dot.y = newY;
					dot.location = newLocation;
				}
			}

			// Smooth opacity interpolation for subtle fade in/out
			const opacityDiff = dot.targetOpacity - dot.opacity;
			dot.opacity += opacityDiff * dot.fadeSpeed;

			// Ensure opacity doesn't go negative
			dot.opacity = Math.max(0, dot.opacity);

			return dot;
		});

		// Continue animation
		animationId = requestAnimationFrame(animateElements);
	}

	// Mouse movement handler
	function handleMouseMove(event) {
		if (!containerElement) return;

		const rect = containerElement.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		
		// Get mouse position relative to container center
		mouseX = event.clientX - rect.left - centerX;
		mouseY = event.clientY - rect.top - centerY;

		// Calculate movement factor (how much the map should move)
		const movementFactor = 0.3; // Adjust this to control sensitivity
		
		// Calculate desired offset (opposite to mouse position)
		const desiredOffsetX = -mouseX * movementFactor;
		const desiredOffsetY = -mouseY * movementFactor;

		// Calculate map bounds
		const actualMapWidth = baseMapWidth * (mapScale / 100);
		const actualMapHeight = baseMapHeight * (mapScale / 100);
		
		// Calculate maximum allowed offsets to keep map within container
		const maxOffsetX = Math.max(0, (actualMapWidth - width) / 2);
		const maxOffsetY = Math.max(0, (actualMapHeight - height) / 2);

		// Smoothly update offsets using animation frame
		const updateOffsets = () => {
			mapOffsetX = mapOffsetX + (Math.max(-maxOffsetX, Math.min(maxOffsetX, desiredOffsetX)) - mapOffsetX) * 0.1;
			mapOffsetY = mapOffsetY + (Math.max(-maxOffsetY, Math.min(maxOffsetY, desiredOffsetY)) - mapOffsetY) * 0.1;
			projection.translate([width / 2 + mapOffsetX, height / 2 + mapOffsetY]);

			if (pulsingDots.length > 0) {
				pulsingDots = pulsingDots.map(dot => {
					const [newX, newY] = projection(dot.location.coords);
					return { ...dot, x: newX, y: newY };
				});
			}
		};

		updateOffsets();
	}

	$effect(() => {
		// Center the map perfectly in viewport
		const scale = Math.min(width, height) * 0.4;
		mapScale = scale;
		projection
			.scale(scale)
			.translate([width / 2 + mapOffsetX, height / 2 + mapOffsetY])
			.center([0, 20]);

		graticule = geoGraticule10();
		outline = { type: "Sphere" };

		// Load geo data and initialize pulsing dots
		json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world) => {
			land = topojson.feature(world, world.objects.land);
			borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

			if (width > 0 && height > 0) {
				// Create exactly 30 pulsing dots
				pulsingDots = createPulsingDots();

				// Start animation after a brief delay
				setTimeout(() => {
					if (animationId) {
						cancelAnimationFrame(animationId);
					}
					animateElements();
				}, 500);
			}
		});

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div 
	class="h-screen w-full overflow-hidden cursor-none" 
	bind:clientWidth={width} 
	bind:clientHeight={height}
	bind:this={containerElement}
	onmousemove={handleMouseMove}
>
	<svg viewBox="0 0 {width} {height}" class="h-full w-full" preserveAspectRatio="xMidYMid meet">
		<!-- Subtle background gradient -->
		<defs>
			<radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
				<stop offset="0%" stop-color="var(--color-gray-50)" stop-opacity="0.3"/>
				<stop offset="100%" stop-color="var(--color-gray-100)" stop-opacity="0.1"/>
			</radialGradient>
			
			<filter id="subtle-glow">
				<feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
				<feMerge> 
					<feMergeNode in="coloredBlur"/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
		</defs>

		<!-- Background -->
		<rect width="100%" height="100%" fill="url(#bg-gradient)" class="map-background"/>

		<!-- Map elements -->
		<path d={path(land)} fill="var(--color-gray-100)" class="map-land"/>
		<path d={path(borders)} fill="none" stroke="var(--color-gray-200)" stroke-width="0.5" class="map-borders"/>

		<!-- Exactly 30 pulsing dots on land with subtle fade in/out -->
		{#each pulsingDots as dot}
			{#if dot.opacity > 0.01}
				<g class="pulsing-dot" transform="translate({dot.x}, {dot.y})" style="opacity: {dot.opacity}">
					<!-- Outer pulse ring -->
					<circle
						cx="0"
						cy="0"
						r={dot.baseSize * (1.8 + dot.pulseIntensity * Math.sin(dot.pulsePhase))}
						fill="none"
						stroke="var(--color-primary-400)"
						stroke-width="1"
						opacity="0.3"
						class="pulse-ring"
						filter="url(#subtle-glow)"
					/>

					<!-- Main dot core -->
					<circle 
						cx="0" 
						cy="0" 
						r={dot.baseSize * (1 + dot.pulseIntensity * 0.3 * Math.sin(dot.pulsePhase))} 
						fill="var(--color-primary-500)" 
						opacity="0.8" 
						class="dot-core"
						filter="url(#subtle-glow)"
					/>

					<!-- Inner bright center -->
					<circle
						cx="0"
						cy="0"
						r={dot.baseSize * 0.4}
						fill="var(--color-primary-300)"
						opacity="1"
						class="dot-center"
					/>
				</g>
			{/if}
		{/each}
	</svg>
</div>

<style>
	.pulsing-dot {
		pointer-events: none;
		transition: opacity 1.5s ease-in-out;
	}

	.map-background {
		animation: subtle-shift 60s ease-in-out infinite;
	}

	.map-land {
		transition: all 0.3s ease;
	}

	.map-borders {
		animation: border-pulse 45s ease-in-out infinite;
	}

	.pulse-ring {
		animation: pulse-ring-subtle 3s ease-in-out infinite;
	}

	.dot-core {
		animation: dot-pulse-subtle 2.5s ease-in-out infinite;
	}

	.dot-center {
		animation: dot-center-glow 2s ease-in-out infinite;
	}

	@keyframes subtle-shift {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.5; }
	}

	@keyframes border-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	@keyframes pulse-ring-subtle {
		0% {
			opacity: 0.1;
			transform: scale(0.9);
		}
		50% {
			opacity: 0.4;
			transform: scale(1.1);
		}
		100% {
			opacity: 0.1;
			transform: scale(1.3);
		}
	}

	@keyframes dot-pulse-subtle {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	@keyframes dot-center-glow {
		0%, 100% {
			opacity: 0.8;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}
</style>
