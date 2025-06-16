<script>
	import { geoMercator, geoGraticule10, geoPath } from "d3-geo";
	import { json } from "d3-fetch";
	import * as topojson from "topojson-client";

	// Prepare Projection.
	const projection = geoMercator();
	// Many other projections are available.
	// See them here: https://github.com/d3/d3-geo#projections.

	// Prepare Graticule: a grid of meridians and parallels
	// for showing projection distortion.
	const graticule = null;

	// Prepare Path-Generator: given a GeoJSON geometry or
	// feature object, it generates an SVG path data string.
	const path = geoPath(projection);

	// Prepare the outline (see https://github.com/d3/d3-geo#_path).
	// "The type Sphere is also supported, which is useful for
	// rendering the outline of the globe; a sphere has no coordinates."
	let outline = { type: "Sphere" };

	// Prepare variables for data to load in.
	let land, borders;

	json(
		// Load the geo-data from npm.
		// More info here: https://github.com/topojson/world-atlas.
		// And here: https://www.npmjs.com/package/world-atlas.
		"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
	).then((world) => {
		// then pull out the land-shapes
		land = topojson.feature(world, world.objects.land);
		// and border-shapes
		borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
	});

	// Specify the chart’s dimensions.
	const width = 1200;
	const height = 600;
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" style:max-width="100%" style:height="auto">
	<!-- <path d={path(outline)} fill="#fff"/> -->
	<!-- <path d={path(graticule)} stroke="#ccc" fill="none"/> -->
	<path d={path(land)} fill="#000" />
	<!-- <path d={path(borders)} fill="none" stroke="#fff" /> -->
	<!-- <path d={path(outline)} fill="none" stroke="#000" /> -->
</svg>
