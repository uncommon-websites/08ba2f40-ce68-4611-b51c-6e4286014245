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

	// Activity dots - minimal set of global locations
	const activityLocations = [
		{ name: "New York", coords: [-74.006, 40.7128] },
		{ name: "London", coords: [-0.1276, 51.5074] },
		{ name: "Tokyo", coords: [139.6917, 35.6895] },
		{ name: "Sydney", coords: [151.2093, -33.8688] },
		{ name: "São Paulo", coords: [-46.6333, -23.5505] },
		{ name: "Mumbai", coords: [72.8777, 19.076] },
		{ name: "Lagos", coords: [3.3792, 6.5244] },
		{ name: "Berlin", coords: [13.405, 52.52] }
	];

	let projectedDots = $state([]);

	$effect(() => {
		// Update projection when dimensions change
		projection.fitSize([width, height], { type: "Sphere" });
		graticule = geoGraticule10();

		// Prepare the outline (see https://github.com/d3/d3-geo#_path).
		// "The type Sphere is also supported, which is useful for
		// rendering the outline of the globe; a sphere has no coordinates."
		outline = { type: "Sphere" };

		// Project activity dots
		projectedDots = activityLocations.map((location, index) => {
			const [x, y] = projection(location.coords);
			return {
				...location,
				x,
				y,
				delay: index * 0.3 // Stagger animations
			};
		});

		// Prepare variables for data to load in.
		// let land, borders;

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
		});
	});
</script>

<div class=" size-full" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height} viewBox="0 0 {width} {height}" class="size-full">
		<!-- <path d={path(outline)} fill="#fff" /> -->
		<!-- <path d={path(graticule)} stroke="var(--color-gray-900)" fill="none" /> -->
		<path d={path(land)} fill="var(--color-gray-800)" />
		<path d={path(borders)} fill="none" stroke="var(--color-gray-900)" />

		<!-- Activity dots -->
		{#each projectedDots as dot}
			<g class="activity-dot" style="--delay: {dot.delay}s">
				<circle cx={dot.x} cy={dot.y} r="2" fill="var(--color-primary-500)" class="dot-core" />
				<circle
					cx={dot.x}
					cy={dot.y}
					r="4"
					fill="var(--color-primary-500)"
					opacity="0.4"
					class="dot-glow"
				/>
			</g>
		{/each}
	</svg>
</div>

<style>
	.activity-dot {
		animation: pulse 20s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	.dot-core {
		filter: drop-shadow(0 0 2px var(--color-primary-500));
	}

	.dot-glow {
		animation: glow 2s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	@keyframes glow {
		0%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.2);
		}
	}
</style>
