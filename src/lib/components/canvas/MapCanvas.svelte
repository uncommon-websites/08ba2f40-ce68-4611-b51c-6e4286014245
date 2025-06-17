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
		{ name: "Istanbul", coords: [28.9784, 41.0082] },
		{ name: "Singapore", coords: [103.8198, 1.3521] },
		{ name: "Dubai", coords: [55.2708, 25.2048] },
		{ name: "Toronto", coords: [-79.3832, 43.6532] },
		{ name: "Seoul", coords: [126.9780, 37.5665] }
	];

	let movingDots = $state([]);
	let animationId = $state(null);
	let hexGrid = $state([]);
	let connectionLines = $state([]);
	let floatingParticles = $state([]);
	let dataStreams = $state([]);

	// Generate hexagonal grid points for tech pattern
	function generateHexGrid() {
		const hexSize = 18;
		const grid = [];

		for (let row = 0; row < Math.ceil(height / (hexSize * 1.5)); row++) {
			for (let col = 0; col < Math.ceil(width / (hexSize * Math.sqrt(3))); col++) {
				const x = col * hexSize * Math.sqrt(3) + ((row % 2) * hexSize * Math.sqrt(3)) / 2;
				const y = row * hexSize * 1.5;

				if (x >= 0 && x <= width && y >= 0 && y <= height) {
					grid.push({
						x,
						y,
						id: `hex-${row}-${col}`,
						flickerDelay: Math.random() * 8000,
						flickerDuration: 800 + Math.random() * 1500,
						isActive: Math.random() > 0.92, // More active hexes
						pulsePhase: Math.random() * Math.PI * 2,
						intensity: 0.1 + Math.random() * 0.15
					});
				}
			}
		}

		return grid;
	}

	// Create floating particles for ambient animation
	function createFloatingParticles() {
		const particles = [];
		const numParticles = 15;

		for (let i = 0; i < numParticles; i++) {
			particles.push({
				id: i,
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.3,
				vy: (Math.random() - 0.5) * 0.3,
				size: 1 + Math.random() * 2,
				opacity: 0.05 + Math.random() * 0.1,
				pulsePhase: Math.random() * Math.PI * 2,
				pulseSpeed: 0.01 + Math.random() * 0.02
			});
		}

		return particles;
	}

	// Create data streams between locations
	function createDataStreams() {
		const streams = [];
		const numStreams = 8;

		for (let i = 0; i < numStreams; i++) {
			const startLocation = landLocations[Math.floor(Math.random() * landLocations.length)];
			const endLocation = landLocations[Math.floor(Math.random() * landLocations.length)];
			
			if (startLocation !== endLocation) {
				const [startX, startY] = projection(startLocation.coords);
				const [endX, endY] = projection(endLocation.coords);

				streams.push({
					id: i,
					startX,
					startY,
					endX,
					endY,
					progress: 0,
					speed: 0.005 + Math.random() * 0.01,
					opacity: 0.1 + Math.random() * 0.15,
					isActive: Math.random() > 0.7,
					nextActivation: Date.now() + Math.random() * 10000
				});
			}
		}

		return streams;
	}

	// Create connection lines between nearby dots
	function updateConnectionLines() {
		const lines = [];
		const visibleDots = movingDots.filter(dot => dot.isVisible);
		
		for (let i = 0; i < visibleDots.length; i++) {
			for (let j = i + 1; j < visibleDots.length; j++) {
				const dot1 = visibleDots[i];
				const dot2 = visibleDots[j];
				const distance = Math.sqrt(Math.pow(dot1.x - dot2.x, 2) + Math.pow(dot1.y - dot2.y, 2));
				
				// Only connect dots that are reasonably close
				if (distance < 200 && Math.random() > 0.85) {
					lines.push({
						x1: dot1.x,
						y1: dot1.y,
						x2: dot2.x,
						y2: dot2.y,
						opacity: Math.max(0.02, 0.1 - distance / 2000),
						animationDelay: Math.random() * 3000
					});
				}
			}
		}
		
		return lines.slice(0, 6); // Limit to 6 connections to keep it subtle
	}

	// Create dynamic pulsing dots on land areas - exactly 30 dots
	function createPulsingDots() {
		const dots = [];
		const numDots = 30; // Exactly 30 dots as requested

		for (let i = 0; i < numDots; i++) {
			const locationIndex = Math.floor(Math.random() * landLocations.length);
			const location = landLocations[locationIndex];
			const [x, y] = projection(location.coords);

			dots.push({
				id: i,
				x,
				y,
				location,
				isVisible: Math.random() > 0.3, // Start with some dots visible, some not
				pulsePhase: Math.random() * Math.PI * 2,
				pulseSpeed: 0.015 + Math.random() * 0.02, // Slower, more subtle pulsing
				fadePhase: Math.random() * Math.PI * 2,
				fadeSpeed: 0.008 + Math.random() * 0.012, // Slow fade speed for subtlety
				visibilityDuration: 4000 + Math.random() * 6000, // Longer visibility for subtlety
				invisibilityDuration: 2000 + Math.random() * 4000, // Longer invisibility
				lastToggleTime: Date.now() + Math.random() * 8000,
				scale: 1,
				baseOpacity: 0.3 + Math.random() * 0.4, // Lower base opacity for subtlety
				currentOpacity: 0,
				targetOpacity: 0,
				baseSize: 1.5 + Math.random() * 2, // Smaller, more subtle sizes
				maxPulseScale: 1.2 + Math.random() * 0.5 // Gentler pulse intensity
			});
		}

		return dots;
	}

	// Animation function for all elements
	function animateElements() {
		const currentTime = Date.now();

		// Animate pulsing dots with smooth in/out transitions
		movingDots = movingDots.map((dot) => {
			dot.pulsePhase += dot.pulseSpeed;
			dot.fadePhase += dot.fadeSpeed;
			
			// Create subtle pulsing effect
			const pulseValue = Math.sin(dot.pulsePhase);
			dot.scale = 1 + (dot.maxPulseScale - 1) * Math.abs(pulseValue) * 0.5; // Gentler scaling
			
			// Handle visibility transitions with smooth fading
			const timeSinceToggle = currentTime - dot.lastToggleTime;
			const currentDuration = dot.isVisible ? dot.visibilityDuration : dot.invisibilityDuration;

			if (timeSinceToggle > currentDuration) {
				dot.isVisible = !dot.isVisible;
				dot.lastToggleTime = currentTime;
				dot.targetOpacity = dot.isVisible ? dot.baseOpacity : 0;

				// When dot becomes invisible, move it to a new random location
				if (!dot.isVisible) {
					const newLocationIndex = Math.floor(Math.random() * landLocations.length);
					const newLocation = landLocations[newLocationIndex];
					const [newX, newY] = projection(newLocation.coords);
					dot.x = newX;
					dot.y = newY;
					dot.location = newLocation;
					
					// Reset properties for variety
					dot.pulseSpeed = 0.015 + Math.random() * 0.02;
					dot.fadeSpeed = 0.008 + Math.random() * 0.012;
					dot.maxPulseScale = 1.2 + Math.random() * 0.5;
					dot.baseSize = 1.5 + Math.random() * 2;
					dot.baseOpacity = 0.3 + Math.random() * 0.4;
				}
			}

			// Smooth opacity interpolation for subtle fade in/out
			const fadeSpeed = 0.02;
			dot.currentOpacity += (dot.targetOpacity - dot.currentOpacity) * fadeSpeed;
			
			// Add subtle fade oscillation when visible
			if (dot.isVisible && dot.currentOpacity > 0.1) {
				const fadeOscillation = Math.sin(dot.fadePhase) * 0.2 + 0.8; // Gentle oscillation
				dot.currentOpacity = dot.currentOpacity * fadeOscillation;
			}

			return dot;
		});

		// Animate hex grid with more dynamic flickering
		hexGrid = hexGrid.map((hex) => {
			if (hex.isActive) {
				hex.pulsePhase += 0.02;
				const shouldFlicker = Math.random() < 0.001;
				if (shouldFlicker) {
					hex.flickerTime = currentTime + hex.flickerDuration;
				}
				hex.active = currentTime < hex.flickerTime;
				hex.currentIntensity = hex.intensity * (1 + 0.3 * Math.sin(hex.pulsePhase));
			}
			return hex;
		});

		// Animate floating particles
		floatingParticles = floatingParticles.map((particle) => {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.pulsePhase += particle.pulseSpeed;

			// Wrap around screen edges
			if (particle.x < 0) particle.x = width;
			if (particle.x > width) particle.x = 0;
			if (particle.y < 0) particle.y = height;
			if (particle.y > height) particle.y = 0;

			// Subtle direction changes
			if (Math.random() < 0.01) {
				particle.vx += (Math.random() - 0.5) * 0.1;
				particle.vy += (Math.random() - 0.5) * 0.1;
				particle.vx = Math.max(-0.5, Math.min(0.5, particle.vx));
				particle.vy = Math.max(-0.5, Math.min(0.5, particle.vy));
			}

			return particle;
		});

		// Animate data streams
		dataStreams = dataStreams.map((stream) => {
			if (stream.isActive) {
				stream.progress += stream.speed;
				if (stream.progress >= 1) {
					stream.progress = 0;
					stream.isActive = false;
					stream.nextActivation = currentTime + 5000 + Math.random() * 10000;
				}
			} else if (currentTime > stream.nextActivation) {
				stream.isActive = true;
				stream.progress = 0;
			}
			return stream;
		});

		// Update connection lines periodically
		if (Math.random() < 0.02) {
			connectionLines = updateConnectionLines();
		}

		animationId = requestAnimationFrame(animateElements);
	}

	$effect(() => {
		// Center the map perfectly in viewport with much larger scaling for zoom
		const scale = Math.min(width, height) * 0.4;
		projection
			.scale(scale)
			.translate([width / 2, height / 2])
			.center([0, 20]); // Slight vertical offset to center better

		graticule = geoGraticule10();
		outline = { type: "Sphere" };

		// Load geo data and initialize all animations
		json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world) => {
			land = topojson.feature(world, world.objects.land);
			borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

			if (width > 0 && height > 0) {
				movingDots = createPulsingDots();
				hexGrid = generateHexGrid();
				floatingParticles = createFloatingParticles();
				dataStreams = createDataStreams();
				connectionLines = updateConnectionLines();

				setTimeout(() => {
					if (animationId) {
						cancelAnimationFrame(animationId);
					}
					animateElements();
				}, 1000);
			}
		});

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div class="h-screen w-full overflow-hidden" bind:clientWidth={width} bind:clientHeight={height}>
	<svg viewBox="0 0 {width} {height}" class="h-full w-full" preserveAspectRatio="xMidYMid meet">
		<!-- Subtle background gradient -->
		<defs>
			<radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
				<stop offset="0%" stop-color="var(--color-gray-50)" stop-opacity="0.3"/>
				<stop offset="100%" stop-color="var(--color-gray-100)" stop-opacity="0.1"/>
			</radialGradient>
			
			<filter id="glow">
				<feGaussianBlur stdDeviation="2" result="coloredBlur"/>
				<feMerge> 
					<feMergeNode in="coloredBlur"/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
			
			<filter id="subtle-glow">
				<feGaussianBlur stdDeviation="1" result="coloredBlur"/>
				<feMerge> 
					<feMergeNode in="coloredBlur"/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
		</defs>

		<!-- Background -->
		<rect width="100%" height="100%" fill="url(#bg-gradient)" class="map-background"/>

		<!-- Floating particles -->
		{#each floatingParticles as particle}
			<circle
				cx={particle.x}
				cy={particle.y}
				r={particle.size}
				fill="var(--color-primary-300)"
				opacity={particle.opacity * (1 + 0.5 * Math.sin(particle.pulsePhase))}
				class="floating-particle"
			/>
		{/each}

		<!-- Data streams -->
		{#each dataStreams as stream}
			{#if stream.isActive && stream.progress > 0}
				<line
					x1={stream.startX + (stream.endX - stream.startX) * Math.max(0, stream.progress - 0.3)}
					y1={stream.startY + (stream.endY - stream.startY) * Math.max(0, stream.progress - 0.3)}
					x2={stream.startX + (stream.endX - stream.startX) * Math.min(1, stream.progress)}
					y2={stream.startY + (stream.endY - stream.startY) * Math.min(1, stream.progress)}
					stroke="var(--color-primary-400)"
					stroke-width="1"
					opacity={stream.opacity}
					class="data-stream"
					filter="url(#subtle-glow)"
				/>
			{/if}
		{/each}

		<!-- Map elements -->
		<path d={path(land)} fill="var(--color-gray-100)" class="map-land"/>
		<path d={path(borders)} fill="none" stroke="var(--color-gray-200)" stroke-width="0.5" class="map-borders"/>

		<!-- Connection lines between dots -->
		{#each connectionLines as line}
			<line
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke="var(--color-primary-400)"
				stroke-width="0.5"
				opacity={line.opacity}
				class="connection-line"
			/>
		{/each}

		<!-- Enhanced hexagonal background grid -->
		{#each hexGrid as hex}
			{#if hex.isActive && hex.active}
				<polygon
					points={`${hex.x},${hex.y - 7} ${hex.x + 6},${hex.y - 3.5} ${hex.x + 6},${hex.y + 3.5} ${hex.x},${hex.y + 7} ${hex.x - 6},${hex.y + 3.5} ${hex.x - 6},${hex.y - 3.5}`}
					fill="none"
					stroke="var(--color-primary-400)"
					stroke-width="0.5"
					opacity={hex.currentIntensity || hex.intensity}
					class="hex-grid enhanced"
					filter="url(#subtle-glow)"
				/>
			{/if}
		{/each}

		<!-- Dynamic pulsing dots on land -->
		{#each movingDots as dot}
			{#if dot.currentOpacity > 0.01}
				<g class="pulsing-dot subtle" transform="translate({dot.x}, {dot.y}) scale({dot.scale})" style="opacity: {dot.currentOpacity}">
					<!-- Outer pulse ring -->
					<circle
						cx="0"
						cy="0"
						r={dot.baseSize * 2.5}
						fill="none"
						stroke="var(--color-primary-400)"
						stroke-width="0.8"
						opacity="0.2"
						class="pulse-ring subtle"
						filter="url(#subtle-glow)"
					/>

					<!-- Main dot core -->
					<circle 
						cx="0" 
						cy="0" 
						r={dot.baseSize} 
						fill="var(--color-primary-500)" 
						opacity="0.8" 
						class="dot-core subtle"
						filter="url(#subtle-glow)"
					/>

					<!-- Inner bright center -->
					<circle
						cx="0"
						cy="0"
						r={dot.baseSize * 0.4}
						fill="var(--color-primary-300)"
						opacity="0.9"
						class="dot-center subtle"
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

	.map-background {
		animation: subtle-shift 60s ease-in-out infinite;
	}

	.map-land {
		transition: all 0.3s ease;
	}

	.map-borders {
		animation: border-pulse 45s ease-in-out infinite;
	}

	.floating-particle {
		animation: float-drift 20s ease-in-out infinite;
	}

	.data-stream {
		animation: stream-flow 3s ease-in-out;
	}

	.connection-line {
		animation: connection-fade 8s ease-in-out infinite;
	}

	.hex-grid.enhanced {
		animation: hex-flicker-enhanced 25s ease-in-out infinite;
	}

	.pulsing-dot.subtle {
		animation: dot-breathe-subtle 3s ease-in-out infinite;
		transition: opacity 0.8s ease-in-out;
	}

	.pulse-ring.subtle {
		animation: pulse-ring-subtle 4s ease-in-out infinite;
	}

	.dot-core.subtle {
		animation: dot-pulse-subtle 2.5s ease-in-out infinite;
	}

	.dot-center.subtle {
		animation: dot-center-subtle 2s ease-in-out infinite;
	}

	@keyframes subtle-shift {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.5; }
	}

	@keyframes border-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	@keyframes float-drift {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}

	@keyframes stream-flow {
		0% { opacity: 0; }
		50% { opacity: 1; }
		100% { opacity: 0; }
	}

	@keyframes connection-fade {
		0%, 100% { opacity: 0; }
		50% { opacity: 0.3; }
	}

	@keyframes hex-flicker-enhanced {
		0% { opacity: 0; }
		25% { opacity: 0.2; }
		50% { opacity: 0.15; }
		75% { opacity: 0.25; }
		100% { opacity: 0.1; }
	}

	@keyframes dot-breathe-subtle {
		0%, 100% { 
			transform: scale(1); 
		}
		50% { 
			transform: scale(1.05); 
		}
	}

	@keyframes pulse-ring-subtle {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.15;
			transform: scale(1.1);
		}
		100% {
			opacity: 0;
			transform: scale(1.4);
		}
	}

	@keyframes dot-pulse-subtle {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
	}

	@keyframes dot-center-subtle {
		0%, 100% {
			opacity: 0.9;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}

	/* Smooth transitions for dynamic elements */
	.hex-grid, .pulsing-dot, .floating-particle {
		transition: opacity 0.3s ease;
	}

	/* Removed all hover effects as requested */
</style>
