<script lang="ts">
	// Hexagonal grid map implementation
	let width = $state(0);
	let height = $state(0);
	let containerElement = $state(null);
	let svgElement = $state(null);

	// Hexagonal grid configuration
	let hexSize = $state(12); // Size of each hexagon
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
						opacity: 0.1 + Math.random() * 0.2,
						pulsePhase: Math.random() * Math.PI * 2,
						pulseSpeed: 0.01 + Math.random() * 0.02
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
		return `M${points.join('L')}Z`;
	}

	// Create active hexagons with agents
	function createActiveHexes() {
		if (hexGrid.length === 0) return [];

		const numActiveHexes = 25; // Number of active hexagons with agents
		const active = [];

		for (let i = 0; i < numActiveHexes; i++) {
			const randomHex = hexGrid[Math.floor(Math.random() * hexGrid.length)];
			
			active.push({
				...randomHex,
				id: `active-${i}`,
				isActive: true,
				opacity: 0,
				targetOpacity: 0.7 + Math.random() * 0.3,
				fadeSpeed: 0.015 + Math.random() * 0.02,
				pulseIntensity: 0.3 + Math.random() * 0.4,
				nextFadeToggle: Date.now() + Math.random() * 3000,
				visibleDuration: 4000 + Math.random() * 6000,
				invisibleDuration: 2000 + Math.random() * 4000,
				isVisible: Math.random() > 0.3,
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
				hex.targetOpacity = hex.isVisible ? 0.7 + Math.random() * 0.3 : 0;

				const duration = hex.isVisible ? hex.visibleDuration : hex.invisibleDuration;
				hex.nextFadeToggle = currentTime + duration;

				// Occasionally move to a new hex location
				if (!hex.isVisible && Math.random() > 0.6) {
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

	$effect(() => {
		if (width > 0 && height > 0) {
			// Calculate hex size based on viewport
			hexSize = Math.max(8, Math.min(width, height) / 60);
			
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
			}, 300);
		}

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div
	class="h-full w-full overflow-hidden"
	bind:clientWidth={width}
	bind:clientHeight={height}
	bind:this={containerElement}
>
	<svg
		viewBox="0 0 {width} {height}"
		class="map-svg h-full w-full"
		preserveAspectRatio="xMidYMid meet"
		bind:this={svgElement}
	>
		<!-- Subtle background gradient -->
		<defs>
			<radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
				<stop offset="0%" stop-color="var(--color-gray-50)" stop-opacity="0.3" />
				<stop offset="100%" stop-color="var(--color-gray-100)" stop-opacity="0.1" />
			</radialGradient>

			<filter id="subtle-glow">
				<feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Background -->
		<rect width="100%" height="100%" fill="url(#bg-gradient)" class="map-background" />

		<!-- Hexagonal Grid Base Layer -->
		{#each hexGrid as hex}
			<path
				d={createHexagonPath(hex.x, hex.y, hexSize)}
				fill="none"
				stroke="var(--color-gray-200)"
				stroke-width="0.5"
				opacity={hex.opacity + 0.1 * Math.sin(hex.pulsePhase)}
				class="hex-grid"
			/>
		{/each}

		<!-- Active Hexagons with Agents -->
		{#each activeHexes as hex}
			{#if hex.opacity > 0.01}
				<g class="active-hex" style="opacity: {hex.opacity}">
					<!-- Hex background with glow -->
					<path
						d={createHexagonPath(hex.x, hex.y, hexSize * (1.1 + 0.1 * Math.sin(hex.pulsePhase)))}
						fill="var(--color-primary-100)"
						stroke="var(--color-primary-400)"
						stroke-width="1.5"
						opacity="0.4"
						class="hex-background"
						filter="url(#subtle-glow)"
					/>

					<!-- Agent indicator in center -->
					<circle
						cx={hex.x}
						cy={hex.y}
						r={hexSize * 0.3 * (1 + 0.2 * Math.sin(hex.pulsePhase))}
						fill={hex.agentType === 0 ? 'var(--color-primary-500)' : 
							  hex.agentType === 1 ? 'var(--color-blue-500)' : 
							  'var(--color-green-500)'}
						opacity="0.9"
						class="agent-indicator"
						filter="url(#subtle-glow)"
					/>

					<!-- Agent pulse ring -->
					<circle
						cx={hex.x}
						cy={hex.y}
						r={hexSize * 0.5 * (1 + 0.3 * Math.sin(hex.pulsePhase + Math.PI))}
						fill="none"
						stroke={hex.agentType === 0 ? 'var(--color-primary-400)' : 
								hex.agentType === 1 ? 'var(--color-blue-400)' : 
								'var(--color-green-400)'}
						stroke-width="1"
						opacity="0.6"
						class="agent-pulse"
					/>
				</g>
			{/if}
		{/each}
	</svg>
</div>

<style>
	.map-svg {
		transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		will-change: transform;
	}

	.map-background {
		animation: subtle-shift 60s ease-in-out infinite;
	}

	.hex-grid {
		transition: opacity 0.3s ease;
		animation: hex-grid-pulse 8s ease-in-out infinite;
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

	@keyframes subtle-shift {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.5;
		}
	}

	@keyframes hex-grid-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	@keyframes hex-glow {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
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
			transform: scale(1.2);
			opacity: 1;
		}
	}

	@keyframes agent-ring-pulse {
		0% {
			opacity: 0.2;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.1);
		}
		100% {
			opacity: 0.2;
			transform: scale(1.4);
		}
	}
</style>
