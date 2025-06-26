<script lang="ts">
	import { onMount } from "svelte";

	// World map with hexagonal overlay implementation
	let width = $state(0);
	let height = $state(0);
	let containerElement = $state(null);
	let svgElement = $state(null);

	// Hexagonal grid configuration
	let hexSize = $state(8); // Smaller hexagons for world map overlay
	let hexGrid = $state([]);
	let activeHexes = $state([]);
	let animationId = $state(null);

	// Generate hexagonal grid coordinates
	function generateHexGrid() {
		const hexes = [];
		const hexWidth = hexSize * Math.sqrt(3);
		const hexHeight = hexSize * 2;
		const vertSpacing = hexHeight * 0.75;

		// Calculate how many hexagons fit in the viewport
		const cols = Math.ceil(width / hexWidth) + 2;
		const rows = Math.ceil(height / vertSpacing) + 2;

		// Start from negative offset to ensure full coverage
		const startX = -hexWidth;
		const startY = -hexHeight;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const x = startX + col * hexWidth + (row % 2) * (hexWidth / 2);
				const y = startY + row * vertSpacing;

				// Only include hexagons that are visible in the viewport
				if (x > -hexWidth && x < width + hexWidth && y > -hexHeight && y < height + hexHeight) {
					hexes.push({
						id: `${row}-${col}`,
						x,
						y,
						row,
						col,
						isActive: false,
						opacity: 0.05 + Math.random() * 0.1,
						pulsePhase: Math.random() * Math.PI * 2,
						pulseSpeed: 0.005 + Math.random() * 0.01
					});
				}
			}
		}

		return hexes;
	}

	// Generate hexagon path
	function createHexagonPath(x, y, size) {
		const points = [];
		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i;
			const px = x + size * Math.cos(angle);
			const py = y + size * Math.sin(angle);
			points.push(`${px},${py}`);
		}
		return `M${points.join("L")}Z`;
	}

	// Create active hexagons with agents
	function createActiveHexes() {
		if (hexGrid.length === 0) return [];

		const numActiveHexes = 35; // Number of active hexagons with agents
		const active = [];

		for (let i = 0; i < numActiveHexes; i++) {
			const randomHex = hexGrid[Math.floor(Math.random() * hexGrid.length)];

			active.push({
				...randomHex,
				id: `active-${i}`,
				isActive: true,
				opacity: 0,
				targetOpacity: 0.6 + Math.random() * 0.4,
				fadeSpeed: 0.01 + Math.random() * 0.015,
				pulseIntensity: 0.2 + Math.random() * 0.3,
				nextFadeToggle: Date.now() + Math.random() * 4000,
				visibleDuration: 3000 + Math.random() * 5000,
				invisibleDuration: 1500 + Math.random() * 3000,
				isVisible: Math.random() > 0.4,
				agentType: Math.floor(Math.random() * 3) // 0: data, 1: analysis, 2: monitoring
			});
		}

		return active;
	}

	// Animation function for hexagonal grid
	function animateHexGrid() {
		const currentTime = Date.now();

		// Animate base hexagon grid with subtle pulsing
		hexGrid = hexGrid.map((hex) => {
			hex.pulsePhase += hex.pulseSpeed;
			return hex;
		});

		// Animate active hexagons with agents
		activeHexes = activeHexes.map((hex) => {
			// Update pulse phase
			hex.pulsePhase += hex.pulseSpeed;

			// Handle fade in/out cycles
			if (currentTime >= hex.nextFadeToggle) {
				hex.isVisible = !hex.isVisible;
				hex.targetOpacity = hex.isVisible ? 0.6 + Math.random() * 0.4 : 0;

				const duration = hex.isVisible ? hex.visibleDuration : hex.invisibleDuration;
				hex.nextFadeToggle = currentTime + duration;

				// Occasionally move to a new hex location
				if (!hex.isVisible && Math.random() > 0.7) {
					const newHex = hexGrid[Math.floor(Math.random() * hexGrid.length)];
					hex.x = newHex.x;
					hex.y = newHex.y;
					hex.row = newHex.row;
					hex.col = newHex.col;
				}
			}

			// Smooth opacity transition
			const opacityDiff = hex.targetOpacity - hex.opacity;
			hex.opacity += opacityDiff * hex.fadeSpeed;
			hex.opacity = Math.max(0, hex.opacity);

			return hex;
		});

		animationId = requestAnimationFrame(animateHexGrid);
	}

	onMount(() => {
		if (width > 0 && height > 0) {
			// Calculate hex size based on viewport
			hexSize = Math.max(6, Math.min(width, height) / 80);

			// Generate hexagonal grid
			hexGrid = generateHexGrid();

			// Create active hexagons with agents
			activeHexes = createActiveHexes();

			// Start animation
			setTimeout(() => {
				if (animationId) {
					cancelAnimationFrame(animationId);
				}
				animateHexGrid();
			}, 500);
		}

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div
	class="relative h-full w-full overflow-hidden"
	bind:clientWidth={width}
	bind:clientHeight={height}
	bind:this={containerElement}
>
	<svg
		viewBox="0 0 2000 857"
		class="world-map-svg absolute inset-0 h-full w-full"
		preserveAspectRatio="xMidYMid meet"
		bind:this={svgElement}
	>
		<!-- World Map Background -->
		<defs>
			<radialGradient id="world-bg-gradient" cx="50%" cy="50%" r="70%">
				<stop offset="0%" stop-color="var(--color-blue-50)" stop-opacity="0.1" />
				<stop offset="100%" stop-color="var(--color-blue-100)" stop-opacity="0.05" />
			</radialGradient>

			<filter id="country-glow">
				<feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>

			<filter id="hex-glow">
				<feGaussianBlur stdDeviation="1" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Ocean background -->
		<rect width="100%" height="100%" fill="url(#world-bg-gradient)" class="ocean-background" />

		<!-- World Countries -->
		<g class="countries">
			<!-- All country paths from the world.svg -->
			<path
				d="M1383 261.6l1.5 1.8-2.9 0.8-2.4 1.1-5.9 0.8-5.3 1.3-2.4 2.8 1.9 2.7 1.4 3.2-2 2.7 0.8 2.5-0.9 2.3-5.2-0.2 3.1 4.2-3.1 1.7-1.4 3.8 1.1 3.9-1.8 1.8-2.1-0.6-4 0.9-0.2 1.7-4.1 0-2.3 3.7 0.8 5.4-6.6 2.7-3.9-0.6-0.9 1.4-3.4-0.8-5.3 1-9.6-3.3 3.9-5.8-1.1-4.1-4.3-1.1-1.2-4.1-2.7-5.1 1.6-3.5-2.5-1 0.5-4.7 0.6-8 5.9 2.5 3.9-0.9 0.4-2.9 4-0.9 2.6-2-0.2-5.1 4.2-1.3 0.3-2.2 2.9 1.7 1.6 0.2 3 0 4.3 1.4 1.8 0.7 3.4-2 2.1 1.2 0.9-2.9 3.2 0.1 0.6-0.9-0.2-2.6 1.7-2.2 3.3 1.4-0.1 2 1.7 0.3 0.9 5.4 2.7 2.1 1.5-1.4 2.2-0.6 2.5-2.9 3.8 0.5 5.4 0z"
				fill="var(--color-gray-200)"
				stroke="var(--color-gray-300)"
				stroke-width="0.3"
				opacity="0.8"
				class="country afghanistan"
			/>

			<!-- Add more country paths as needed - for brevity, showing just Afghanistan -->
			<!-- You can include all the paths from the world.svg file -->
		</g>

		<!-- Hexagonal Grid Overlay -->
		<g class="hex-overlay" opacity="0.6">
			<!-- Base hexagonal grid -->
			{#each hexGrid as hex}
				<path
					d={createHexagonPath(hex.x * (width / 2000), hex.y * (height / 857), hexSize)}
					fill="none"
					stroke="var(--color-primary-300)"
					stroke-width="0.3"
					opacity={hex.opacity + 0.05 * Math.sin(hex.pulsePhase)}
					class="hex-grid-line"
				/>
			{/each}

			<!-- Active Hexagons with Agents -->
			{#each activeHexes as hex}
				{#if hex.opacity > 0.01}
					<g class="active-hex" style="opacity: {hex.opacity}">
						<!-- Hex background with glow -->
						<path
							d={createHexagonPath(
								hex.x * (width / 2000),
								hex.y * (height / 857),
								hexSize * (1.2 + 0.1 * Math.sin(hex.pulsePhase))
							)}
							fill="var(--color-primary-100)"
							stroke="var(--color-primary-500)"
							stroke-width="1"
							opacity="0.5"
							class="hex-background"
							filter="url(#hex-glow)"
						/>

						<!-- Agent indicator in center -->
						<circle
							cx={hex.x * (width / 2000)}
							cy={hex.y * (height / 857)}
							r={hexSize * 0.25 * (1 + 0.2 * Math.sin(hex.pulsePhase))}
							fill={hex.agentType === 0
								? "var(--color-primary-500)"
								: hex.agentType === 1
									? "var(--color-blue-500)"
									: "var(--color-green-500)"}
							opacity="0.9"
							class="agent-indicator"
							filter="url(#hex-glow)"
						/>

						<!-- Agent pulse ring -->
						<circle
							cx={hex.x * (width / 2000)}
							cy={hex.y * (height / 857)}
							r={hexSize * 0.4 * (1 + 0.3 * Math.sin(hex.pulsePhase + Math.PI))}
							fill="none"
							stroke={hex.agentType === 0
								? "var(--color-primary-400)"
								: hex.agentType === 1
									? "var(--color-blue-400)"
									: "var(--color-green-400)"}
							stroke-width="0.8"
							opacity="0.5"
							class="agent-pulse"
						/>
					</g>
				{/if}
			{/each}
		</g>
	</svg>
</div>

<style>
	.world-map-svg {
		transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		will-change: transform;
	}

	.ocean-background {
		animation: ocean-pulse 30s ease-in-out infinite;
	}

	.countries .country {
		transition:
			fill 0.3s ease,
			opacity 0.3s ease;
		cursor: pointer;
	}

	.countries .country:hover {
		fill: var(--color-primary-100);
		opacity: 1;
		filter: url(#country-glow);
	}

	.hex-grid-line {
		transition: opacity 0.3s ease;
		animation: hex-grid-pulse 12s ease-in-out infinite;
	}

	.active-hex {
		pointer-events: none;
		transition: opacity 2s ease-in-out;
	}

	.hex-background {
		animation: hex-glow 4s ease-in-out infinite;
	}

	.agent-indicator {
		animation: agent-pulse 3s ease-in-out infinite;
	}

	.agent-pulse {
		animation: agent-ring-pulse 2.5s ease-in-out infinite;
	}

	@keyframes ocean-pulse {
		0%,
		100% {
			opacity: 0.1;
		}
		50% {
			opacity: 0.2;
		}
	}

	@keyframes hex-grid-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	@keyframes hex-glow {
		0%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.05);
		}
	}

	@keyframes agent-pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.9;
		}
		50% {
			transform: scale(1.15);
			opacity: 1;
		}
	}

	@keyframes agent-ring-pulse {
		0% {
			opacity: 0.2;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.1);
		}
		100% {
			opacity: 0.2;
			transform: scale(1.3);
		}
	}
</style>
