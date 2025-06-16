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

	$effect(() => {
		// Update projection when dimensions change
		projection.fitSize([width, height], { type: "Sphere" });
		graticule = geoGraticule10();

		// Prepare the outline (see https://github.com/d3/d3-geo#_path).
		// "The type Sphere is also supported, which is useful for
		// rendering the outline of the globe; a sphere has no coordinates."
		outline = { type: "Sphere" };

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
		<path d={path(graticule)} stroke="var(--color-gray-900)" fill="none" />
		<path d={path(land)} fill="var(--color-gray-900)" />
		<path d={path(borders)} fill="none" stroke="var(--color-gray-800)" />
	</svg>
</div>
