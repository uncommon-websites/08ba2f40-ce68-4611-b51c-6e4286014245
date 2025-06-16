<!--
@component WorldMapCanvas
Animated world map background with pulsing dots on land areas
-->

<script lang="ts">
	import { onMount } from "svelte";

	type Props = {
		class?: string;
	};

	let { class: className = "", ...rest }: Props = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationId: number;
	let isVisible = false;

	// World map data - simplified land coordinates
	let landDots: Array<{
		x: number;
		y: number;
		pulse: number;
		pulseSpeed: number;
		opacity: number;
		size: number;
	}> = [];

	// Actual world map coordinates (normalized 0-1) - simplified continent outlines
	const continentPaths = [
		// North America
		{
			name: "North America",
			path: [
				[0.05, 0.15], [0.08, 0.12], [0.12, 0.10], [0.18, 0.08], [0.25, 0.12], [0.30, 0.15],
				[0.32, 0.20], [0.35, 0.25], [0.33, 0.30], [0.30, 0.35], [0.25, 0.40], [0.20, 0.42],
				[0.15, 0.45], [0.12, 0.50], [0.18, 0.55], [0.22, 0.58], [0.25, 0.62], [0.20, 0.65],
				[0.15, 0.62], [0.10, 0.58], [0.08, 0.52], [0.05, 0.45], [0.02, 0.35], [0.03, 0.25]
			]
		},
		// South America
		{
			name: "South America",
			path: [
				[0.22, 0.52], [0.25, 0.50], [0.28, 0.55], [0.30, 0.60], [0.32, 0.65], [0.33, 0.70],
				[0.32, 0.75], [0.30, 0.80], [0.28, 0.85], [0.25, 0.88], [0.22, 0.85], [0.20, 0.80],
				[0.18, 0.75], [0.19, 0.70], [0.20, 0.65], [0.21, 0.60], [0.22, 0.55]
			]
		},
		// Europe
		{
			name: "Europe",
			path: [
				[0.45, 0.18], [0.48, 0.15], [0.52, 0.16], [0.55, 0.18], [0.58, 0.20], [0.60, 0.22],
				[0.58, 0.25], [0.55, 0.28], [0.52, 0.30], [0.48, 0.28], [0.45, 0.25], [0.44, 0.22]
			]
		},
		// Africa
		{
			name: "Africa",
			path: [
				[0.47, 0.32], [0.50, 0.30], [0.53, 0.32], [0.55, 0.35], [0.57, 0.40], [0.58, 0.45],
				[0.57, 0.50], [0.56, 0.55], [0.54, 0.60], [0.52, 0.65], [0.50, 0.68], [0.48, 0.65],
				[0.46, 0.60], [0.45, 0.55], [0.44, 0.50], [0.45, 0.45], [0.46, 0.40], [0.47, 0.35]
			]
		},
		// Asia
		{
			name: "Asia",
			path: [
				[0.60, 0.12], [0.65, 0.10], [0.70, 0.08], [0.75, 0.10], [0.80, 0.12], [0.85, 0.15],
				[0.88, 0.18], [0.90, 0.22], [0.88, 0.25], [0.85, 0.28], [0.82, 0.32], [0.78, 0.35],
				[0.75, 0.38], [0.70, 0.40], [0.65, 0.38], [0.62, 0.35], [0.60, 0.30], [0.58, 0.25],
				[0.59, 0.20], [0.60, 0.15]
			]
		},
		// Australia
		{
			name: "Australia",
			path: [
				[0.75, 0.62], [0.78, 0.60], [0.82, 0.62], [0.85, 0.64], [0.83, 0.67], [0.80, 0.69],
				[0.77, 0.68], [0.75, 0.65]
			]
		},
		// Greenland
		{
			name: "Greenland",
			path: [
				[0.35, 0.05], [0.38, 0.03], [0.42, 0.05], [0.44, 0.08], [0.42, 0.12], [0.38, 0.14],
				[0.35, 0.12], [0.33, 0.08]
			]
		}
	];

	// Generate land areas from continent paths for dot placement
	const landAreas = continentPaths.map(continent => {
		const xs = continent.path.map(p => p[0]);
		const ys = continent.path.map(p => p[1]);
		return {
			x: Math.min(...xs),
			y: Math.min(...ys),
			width: Math.max(...xs) - Math.min(...xs),
			height: Math.max(...ys) - Math.min(...ys),
			path: continent.path
		};
	});

	function resizeCanvas() {
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;

		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;

		if (ctx) {
			ctx.scale(dpr, dpr);
		}

		canvas.style.width = rect.width + "px";
		canvas.style.height = rect.height + "px";

		initializeLandDots();
	}

	function isPointInPolygon(x: number, y: number, polygon: number[][]) {
		let inside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			if (((polygon[i][1] > y) !== (polygon[j][1] > y)) &&
				(x < (polygon[j][0] - polygon[i][0]) * (y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
				inside = !inside;
			}
		}
		return inside;
	}

	function initializeLandDots() {
		if (!canvas) return;

		landDots = [];
		const canvasWidth = canvas.offsetWidth;
		const canvasHeight = canvas.offsetHeight;

		// Generate dots for each land area
		landAreas.forEach((area) => {
			const dotsInArea = Math.floor((area.width * area.height) * 1200); // Increased density
			let attempts = 0;
			let dotsPlaced = 0;
			
			while (dotsPlaced < dotsInArea && attempts < dotsInArea * 3) {
				attempts++;
				
				// Random position within the bounding box
				const normalizedX = area.x + Math.random() * area.width;
				const normalizedY = area.y + Math.random() * area.height;
				
				// Check if point is inside the actual continent shape
				if (area.path && isPointInPolygon(normalizedX, normalizedY, area.path)) {
					const x = normalizedX * canvasWidth;
					const y = normalizedY * canvasHeight;

					landDots.push({
						x,
						y,
						pulse: Math.random() * Math.PI * 2,
						pulseSpeed: 0.01 + Math.random() * 0.02,
						opacity: 0.2 + Math.random() * 0.4,
						size: 0.5 + Math.random() * 1.5
					});
					dotsPlaced++;
				}
			}
		});
	}

	function getColors() {
		const isDark = document.documentElement.dataset.theme === "dark";
		
		return {
			mapOutline: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
			dots: isDark ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.5)",
			activeDots: isDark ? "rgba(34, 197, 94, 0.8)" : "rgba(34, 197, 94, 0.7)",
			background: isDark ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.02)"
		};
	}

	function drawWorldOutline() {
		if (!ctx) return;

		const colors = getColors();
		const canvasWidth = canvas.offsetWidth;
		const canvasHeight = canvas.offsetHeight;

		ctx.strokeStyle = colors.mapOutline;
		ctx.lineWidth = 1.5;
		ctx.fillStyle = colors.mapOutline.replace(/[\d.]+\)$/, '0.03)');

		// Draw actual continent outlines
		continentPaths.forEach((continent) => {
			if (continent.path.length < 3) return;

			ctx.beginPath();
			
			// Move to first point
			const firstPoint = continent.path[0];
			ctx.moveTo(firstPoint[0] * canvasWidth, firstPoint[1] * canvasHeight);
			
			// Draw smooth curves through all points
			for (let i = 1; i < continent.path.length; i++) {
				const point = continent.path[i];
				const nextPoint = continent.path[(i + 1) % continent.path.length];
				
				const currentX = point[0] * canvasWidth;
				const currentY = point[1] * canvasHeight;
				const nextX = nextPoint[0] * canvasWidth;
				const nextY = nextPoint[1] * canvasHeight;
				
				// Create smooth curves using quadratic curves
				const controlX = currentX + (nextX - currentX) * 0.5;
				const controlY = currentY + (nextY - currentY) * 0.5;
				
				ctx.quadraticCurveTo(currentX, currentY, controlX, controlY);
			}
			
			// Close the path
			ctx.closePath();
			
			// Fill with very subtle color
			ctx.fill();
			
			// Stroke the outline
			ctx.stroke();
		});
	}

	function drawLandDots(time: number) {
		if (!ctx) return;

		const colors = getColors();

		landDots.forEach((dot, index) => {
			// Update pulse
			dot.pulse += dot.pulseSpeed;
			
			// Calculate pulsing effect
			const pulseIntensity = Math.sin(dot.pulse) * 0.5 + 0.5;
			const currentOpacity = dot.opacity * (0.3 + pulseIntensity * 0.7);
			const currentSize = dot.size * (0.8 + pulseIntensity * 0.4);

			// Occasionally make some dots more active
			const isActive = Math.sin(time * 0.001 + index * 0.1) > 0.95;
			const dotColor = isActive ? colors.activeDots : colors.dots;
			const finalOpacity = isActive ? Math.min(currentOpacity * 1.5, 1) : currentOpacity;

			// Draw dot
			ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${finalOpacity})`);
			ctx.beginPath();
			ctx.arc(dot.x, dot.y, currentSize, 0, Math.PI * 2);
			ctx.fill();

			// Add subtle glow for active dots
			if (isActive) {
				ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${finalOpacity * 0.3})`);
				ctx.beginPath();
				ctx.arc(dot.x, dot.y, currentSize * 2, 0, Math.PI * 2);
				ctx.fill();
			}
		});
	}

	function animate(time: number) {
		if (!ctx || !canvas || !isVisible) return;

		const colors = getColors();

		// Clear canvas
		ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		// Draw subtle background
		ctx.fillStyle = colors.background;
		ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		// Draw world outline
		drawWorldOutline();

		// Draw animated land dots
		drawLandDots(time);

		animationId = requestAnimationFrame(animate);
	}

	onMount(() => {
		ctx = canvas.getContext("2d")!;

		// Set up intersection observer to only animate when visible
		const observer = new IntersectionObserver(
			(entries) => {
				isVisible = entries[0].isIntersecting;
				if (isVisible) {
					resizeCanvas();
					animate(performance.now());
				} else if (animationId) {
					cancelAnimationFrame(animationId);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(canvas);

		// Handle resize
		const resizeObserver = new ResizeObserver(resizeCanvas);
		resizeObserver.observe(canvas);

		const handleWindowResize = () => {
			clearTimeout(window.resizeTimeout);
			window.resizeTimeout = setTimeout(resizeCanvas, 100);
		};

		window.addEventListener("resize", handleWindowResize);

		// Listen for theme changes
		const themeObserver = new MutationObserver(() => {
			if (isVisible) {
				animate(performance.now());
			}
		});

		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"]
		});

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			observer.disconnect();
			resizeObserver.disconnect();
			themeObserver.disconnect();
			window.removeEventListener("resize", handleWindowResize);
			clearTimeout(window.resizeTimeout);
		};
	});
</script>

<canvas bind:this={canvas} class={`absolute inset-0 size-full ${className}`} {...rest}></canvas>