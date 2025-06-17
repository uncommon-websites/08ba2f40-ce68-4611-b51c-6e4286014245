<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	const props: HTMLAttributes<SVGSVGElement> = $props();
</script>

<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="" {...props}>
<g>
<!-- Central hub/node -->
<circle cx="250" cy="250" r="25" fill="currentColor"/>

<!-- Hexagonal grid pattern -->
<g stroke="currentColor" stroke-width="3" fill="none">
<!-- Inner hexagon -->
<polygon points="250,200 285,225 285,275 250,300 215,275 215,225"/>

<!-- Outer hexagons -->
<polygon points="250,120 320,165 320,235 250,280 180,235 180,165"/>
<polygon points="180,95 250,140 320,95 390,140 390,210 320,255 250,210 180,255 110,210 110,140"/>

<!-- Connection lines -->
<line x1="250" y1="250" x2="250" y2="200"/>
<line x1="250" y1="250" x2="285" y2="225"/>
<line x1="250" y1="250" x2="285" y2="275"/>
<line x1="250" y1="250" x2="215" y2="275"/>
<line x1="250" y1="250" x2="215" y2="225"/>

<!-- Agent nodes -->
<circle cx="180" cy="165" r="8" fill="currentColor"/>
<circle cx="320" cy="165" r="8" fill="currentColor"/>
<circle cx="390" cy="210" r="8" fill="currentColor"/>
<circle cx="320" cy="255" r="8" fill="currentColor"/>
<circle cx="180" cy="255" r="8" fill="currentColor"/>
<circle cx="110" cy="210" r="8" fill="currentColor"/>

<!-- Data flow indicators -->
<circle cx="215" cy="190" r="4" fill="currentColor" opacity="0.6"/>
<circle cx="285" cy="190" r="4" fill="currentColor" opacity="0.6"/>
<circle cx="320" cy="225" r="4" fill="currentColor" opacity="0.6"/>
<circle cx="285" cy="310" r="4" fill="currentColor" opacity="0.6"/>
<circle cx="215" cy="310" r="4" fill="currentColor" opacity="0.6"/>
<circle cx="180" cy="225" r="4" fill="currentColor" opacity="0.6"/>
</g>

<!-- Letter P integration -->
<g fill="currentColor">
<rect x="350" y="350" width="8" height="80"/>
<rect x="350" y="350" width="30" height="8"/>
<rect x="350" y="385" width="25" height="8"/>
<rect x="375" y="358" width="8" height="27"/>
</g>
</g>
</svg>

