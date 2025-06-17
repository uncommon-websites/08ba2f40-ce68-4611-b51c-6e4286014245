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

	// Create moving dots with paths between land locations
	function createMovingDots() {
		const dots = [];
		const numDots = 6;

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

			// Create hexagonal path points
			const pathPoints = [];
			const numSegments = 8;
			for (let j = 0; j <= numSegments; j++) {
				const t = j / numSegments;
				const x = startX + (endX - startX) * t;
				const y = startY + (endY - startY) * t;
				pathPoints.push({ x, y, active: false, flickerTime: 0 });
			}

			dots.push({
				id: i,
				startX,
				startY,
				endX,
				endY,
				currentX: startX,
				currentY: startY,
				progress: 0,
				speed: 0.003 + Math.random() * 0.002,
				pathPoints,
				startLocation: start,
				endLocation: end,
				delay: i * 1500 + Math.random() * 2000,
				flickerPhase: Math.random() * Math.PI * 2
			});
		}

		return dots;
	}

	// Animation function
	function animateDots() {
		const currentTime = Date.now();
		
		movingDots = movingDots.map((dot) => {
			// Update progress
			dot.progress += dot.speed;
			dot.flickerPhase += 0.1;

			// Calculate current position using smooth interpolation
			const t = Math.min(dot.progress, 1);
			const smoothT = t * t * (3 - 2 * t);

			const newX = dot.startX + (dot.endX - dot.startX) * smoothT;
			const newY = dot.startY + (dot.endY - dot.startY) * smoothT;

			dot.currentX = newX;
			dot.currentY = newY;

			// Update path points with flickering effect
			dot.pathPoints = dot.pathPoints.map((point, index) => {
				const distanceFromCurrent = Math.abs(index - (t * (dot.pathPoints.length - 1)));
				const isNearCurrent = distanceFromCurrent < 3;
				const flickerChance = isNearCurrent ? 0.3 : 0.05;
				
				// Create flickering effect
				const shouldFlicker = Math.random() < flickerChance;
				if (shouldFlicker) {
					point.flickerTime = currentTime + 150 + Math.random() * 100;
				}
				
				point.active = currentTime < point.flickerTime;
				return point;
			});

			// Reset when reaching destination
			if (dot.progress >= 1) {
				let newEndIndex = Math.floor(Math.random() * landLocations.length);
				const currentEndIndex = landLocations.findIndex((loc) => loc.name === dot.endLocation.name);
				while (newEndIndex === currentEndIndex) {
					newEndIndex = Math.floor(Math.random() * landLocations.length);
				}

				const newEnd = landLocations[newEndIndex];
				const [newEndX, newEndY] = projection(newEnd.coords);

				// Create new hexagonal path
				const pathPoints = [];
				const numSegments = 8;
				for (let j = 0; j <= numSegments; j++) {
					const t = j / numSegments;
					const x = dot.currentX + (newEndX - dot.currentX) * t;
					const y = dot.currentY + (newEndY - dot.currentY) * t;
					pathPoints.push({ x, y, active: false, flickerTime: 0 });
				}

				dot.startX = dot.currentX;
				dot.startY = dot.currentY;
				dot.endX = newEndX;
				dot.endY = newEndY;
				dot.startLocation = dot.endLocation;
				dot.endLocation = newEnd;
				dot.progress = 0;
				dot.pathPoints = pathPoints;
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

			// Initialize moving dots and hex grid after projection is set up
			if (width > 0 && height > 0) {
				movingDots = createMovingDots();
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

		<!-- Moving dots with hexagonal trail patterns -->
		{#each movingDots as dot}
			<g class="moving-dot">
				<!-- Hexagonal path trail -->
				{#each dot.pathPoints as point, index}
					{#if point.active}
						<polygon
							points={`${point.x},${point.y-3} ${point.x+2.5},${point.y-1.5} ${point.x+2.5},${point.y+1.5} ${point.x},${point.y+3} ${point.x-2.5},${point.y+1.5} ${point.x-2.5},${point.y-1.5}`}
							fill="var(--color-primary-400)"
							opacity="0.6"
							class="trail-hex"
						/>
					{/if}
				{/each}

				<!-- Connection lines between active points -->
				{#each dot.pathPoints as point, index}
					{#if point.active && index < dot.pathPoints.length - 1}
						{@const nextPoint = dot.pathPoints[index + 1]}
						{#if nextPoint.active}
							<line
								x1={point.x}
								y1={point.y}
								x2={nextPoint.x}
								y2={nextPoint.y}
								stroke="var(--color-primary-500)"
								stroke-width="1"
								opacity="0.4"
								class="connection-line"
							/>
						{/if}
					{/if}
				{/each}

				<!-- Main moving dot -->
				<polygon
					points={`${dot.currentX},${dot.currentY-4} ${dot.currentX+3.5},${dot.currentY-2} ${dot.currentX+3.5},${dot.currentY+2} ${dot.currentX},${dot.currentY+4} ${dot.currentX-3.5},${dot.currentY+2} ${dot.currentX-3.5},${dot.currentY-2}`}
					fill="var(--color-primary-500)"
					class="dot-core-hex"
				/>
			</g>
		{/each}
	</svg>
</div>

<style>
	.moving-dot {
		pointer-events: none;
	}

	.hex-grid {
		animation: hex-flicker 0.15s ease-in-out;
	}

	.trail-hex {
		animation: trail-flicker 0.2s ease-in-out;
	}

	.connection-line {
		animation: line-pulse 0.3s ease-in-out;
	}

	.dot-core-hex {
		filter: drop-shadow(0 0 2px var(--color-primary-500));
		animation: hex-pulse 3s ease-in-out infinite;
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

	@keyframes trail-flicker {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.1);
		}
		100% {
			opacity: 0.6;
			transform: scale(1);
		}
	}

	@keyframes line-pulse {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			opacity: 0.4;
		}
	}

	@keyframes hex-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	}
</style>
