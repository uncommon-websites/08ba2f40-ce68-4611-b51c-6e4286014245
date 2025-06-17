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

	// Create moving dots with paths between land locations
	function createMovingDots() {
		const dots = [];
		const numDots = 8;

		for (let i = 0; i < numDots; i++) {
			const startIndex = Math.floor(Math.random() * landLocations.length);
			let endIndex = Math.floor(Math.random() * landLocations.length);
			while (endIndex === startIndex) {
				endIndex = Math.floor(Math.random() * landLocations.length);
			}

			const start = landLocations[startIndex];
			const end = landLocations[endIndex];
			const [startX, startY] = projection(start.coords);
			const [endX, endY] = projection(end.coords);

			dots.push({
				id: i,
				startX,
				startY,
				endX,
				endY,
				currentX: startX,
				currentY: startY,
				progress: 0,
				speed: 0.004 + Math.random() * 0.0004, // Very slow movement
				trail: [], // Store trail points
				maxTrailLength: 15,
				startLocation: start,
				endLocation: end,
				delay: i * 2000 + Math.random() * 3000 // Stagger start times
			});
		}

		return dots;
	}

	// Animation function
	function animateDots() {
		movingDots = movingDots.map((dot) => {
			// Update progress
			dot.progress += dot.speed;

			// Calculate current position using smooth interpolation
			const t = Math.min(dot.progress, 1);
			const smoothT = t * t * (3 - 2 * t); // Smooth step function

			const newX = dot.startX + (dot.endX - dot.startX) * smoothT;
			const newY = dot.startY + (dot.endY - dot.startY) * smoothT;

			// Add current position to trail
			dot.trail.push({ x: dot.currentX, y: dot.currentY, opacity: 1 });

			// Limit trail length and fade older points
			if (dot.trail.length > dot.maxTrailLength) {
				dot.trail.shift();
			}

			// Update trail opacity
			dot.trail = dot.trail.map((point, index) => ({
				...point,
				opacity: (index / dot.trail.length) * 0.6
			}));

			dot.currentX = newX;
			dot.currentY = newY;

			// Reset when reaching destination
			if (dot.progress >= 1) {
				// Choose new random destination
				let newEndIndex = Math.floor(Math.random() * landLocations.length);
				const currentEndIndex = landLocations.findIndex((loc) => loc.name === dot.endLocation.name);
				while (newEndIndex === currentEndIndex) {
					newEndIndex = Math.floor(Math.random() * landLocations.length);
				}

				const newEnd = landLocations[newEndIndex];
				const [newEndX, newEndY] = projection(newEnd.coords);

				dot.startX = dot.currentX;
				dot.startY = dot.currentY;
				dot.endX = newEndX;
				dot.endY = newEndY;
				dot.startLocation = dot.endLocation;
				dot.endLocation = newEnd;
				dot.progress = 0;
				dot.trail = []; // Clear trail when starting new journey
			}

			return dot;
		});

		animationId = requestAnimationFrame(animateDots);
	}

	$effect(() => {
		// Update projection when dimensions change
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

			// Initialize moving dots after projection is set up
			if (width > 0 && height > 0) {
				movingDots = createMovingDots();

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

		<!-- Moving dots with trails -->
		{#each movingDots as dot}
			<g class="moving-dot">
				<!-- Trail -->
				{#each dot.trail as trailPoint, index}
					<circle
						cx={trailPoint.x}
						cy={trailPoint.y}
						r={1 + (index / dot.trail.length) * 1}
						fill="var(--color-primary-400)"
						opacity={trailPoint.opacity}
						class="trail-point"
					/>
				{/each}

				<!-- Main dot -->
				<circle
					cx={dot.currentX}
					cy={dot.currentY}
					r="2"
					fill="var(--color-primary-500)"
					class="dot-core"
				/>
				<circle
					cx={dot.currentX}
					cy={dot.currentY}
					r="4"
					fill="var(--color-primary-500)"
					opacity="0.3"
					class="dot-glow"
				/>
			</g>
		{/each}
	</svg>
</div>

<style>
	.moving-dot {
		pointer-events: none;
	}

	.dot-core {
		filter: drop-shadow(0 0 3px var(--color-primary-500));
		animation: subtle-pulse 4s ease-in-out infinite;
	}

	/* .dot-glow {
		animation: subtle-glow 3s ease-in-out infinite;
	} */

	.trail-point {
		filter: drop-shadow(0 0 1px var(--color-primary-400));
		transition: opacity 0.3s ease-out;
	}

	@keyframes subtle-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	@keyframes subtle-glow {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.1);
		}
	}
</style>
