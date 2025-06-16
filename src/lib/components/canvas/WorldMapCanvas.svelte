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

	// Simplified world land coordinates (normalized 0-1)
	const landAreas = [
		// North America
		{ x: 0.15, y: 0.25, width: 0.2, height: 0.15 },
		{ x: 0.1, y: 0.4, width: 0.15, height: 0.1 },
		
		// South America
		{ x: 0.22, y: 0.55, width: 0.08, height: 0.25 },
		
		// Europe
		{ x: 0.48, y: 0.22, width: 0.12, height: 0.08 },
		
		// Africa
		{ x: 0.48, y: 0.35, width: 0.1, height: 0.25 },
		
		// Asia
		{ x: 0.6, y: 0.15, width: 0.25, height: 0.2 },
		{ x: 0.65, y: 0.35, width: 0.15, height: 0.15 },
		
		// Australia
		{ x: 0.75, y: 0.65, width: 0.08, height: 0.06 },
		
		// Additional land masses
		{ x: 0.7, y: 0.25, width: 0.1, height: 0.08 }, // Eastern Asia
		{ x: 0.85, y: 0.45, width: 0.06, height: 0.1 }, // Southeast Asia islands
	];

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

	function initializeLandDots() {
		if (!canvas) return;

		landDots = [];
		const canvasWidth = canvas.offsetWidth;
		const canvasHeight = canvas.offsetHeight;

		// Generate dots for each land area
		landAreas.forEach((area) => {
			const dotsInArea = Math.floor((area.width * area.height) * 800); // Density control
			
			for (let i = 0; i < dotsInArea; i++) {
				// Random position within the land area
				const x = (area.x + Math.random() * area.width) * canvasWidth;
				const y = (area.y + Math.random() * area.height) * canvasHeight;

				landDots.push({
					x,
					y,
					pulse: Math.random() * Math.PI * 2,
					pulseSpeed: 0.01 + Math.random() * 0.02,
					opacity: 0.2 + Math.random() * 0.4,
					size: 0.5 + Math.random() * 1.5
				});
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
		ctx.lineWidth = 1;

		// Draw simplified continent outlines
		landAreas.forEach((area) => {
			const x = area.x * canvasWidth;
			const y = area.y * canvasHeight;
			const width = area.width * canvasWidth;
			const height = area.height * canvasHeight;

			// Draw organic-looking continent shapes
			ctx.beginPath();
			ctx.ellipse(
				x + width / 2,
				y + height / 2,
				width / 2,
				height / 2,
				0,
				0,
				Math.PI * 2
			);
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