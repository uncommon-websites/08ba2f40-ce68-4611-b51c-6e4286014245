<!--
@component MapCanvas
Interactive map canvas with hexagonal grid, animated agents, and geospatial effects
Perfect for Proximity's "Google Maps for agents" concept
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

	// Animation state
	let agents: Array<{
		x: number;
		y: number;
		targetX: number;
		targetY: number;
		progress: number;
		speed: number;
		color: string;
		size: number;
		pulse: number;
	}> = [];

	let hexGrid: Array<{
		x: number;
		y: number;
		opacity: number;
		active: boolean;
		activationTime: number;
	}> = [];

	// Clean monochrome color palette
	const getColors = () => {
		const isDark = document.documentElement.dataset.theme === "dark";

		// Monochrome greys based on black
		const baseGrey = isDark ? "#1a1a1a" : "#f8f8f8";
		const lightGrey = isDark ? "#2a2a2a" : "#f0f0f0";
		const mediumGrey = isDark ? "#404040" : "#e0e0e0";
		const darkGrey = isDark ? "#606060" : "#c0c0c0";

		return {
			// Subtle colored dots with opacity
			primary: `rgba(59, 130, 246, 0.6)`, // Blue
			secondary: `rgba(168, 85, 247, 0.6)`, // Purple
			accent: `rgba(34, 197, 94, 0.6)`, // Green
			success: `rgba(249, 115, 22, 0.6)`, // Orange
			warning: `rgba(239, 68, 68, 0.6)`, // Red
			// Clean monochrome background elements
			grid: `rgba(128, 128, 128, ${isDark ? 0.03 : 0.02})`,
			gridActive: `rgba(128, 128, 128, ${isDark ? 0.08 : 0.05})`,
			background: baseGrey,
			connections: `rgba(128, 128, 128, ${isDark ? 0.05 : 0.03})`,
			particles: `rgba(128, 128, 128, ${isDark ? 0.02 : 0.01})`,
			hexStroke: `rgba(128, 128, 128, ${isDark ? 0.05 : 0.03})`
		};
	};

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

		initializeGrid();
		initializeAgents();
	}

	function initializeGrid() {
		if (!canvas) return;

		hexGrid = [];
		const hexSize = 25;
		const hexWidth = hexSize * 2;
		const hexHeight = Math.sqrt(3) * hexSize;

		const cols = Math.ceil(canvas.offsetWidth / (hexWidth * 0.75)) + 2;
		const rows = Math.ceil(canvas.offsetHeight / hexHeight) + 2;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const x = col * (hexWidth * 0.75);
				const y = row * hexHeight + (col % 2) * (hexHeight / 2);

				hexGrid.push({
					x,
					y,
					opacity: Math.random() * 0.15 + 0.05,
					active: false,
					activationTime: 0
				});
			}
		}
	}

	function initializeAgents() {
		if (!canvas) return;

		agents = [];
		const colors = getColors();
		const agentColors = [
			colors.primary,
			colors.secondary,
			colors.accent,
			colors.success,
			colors.warning
		];

		for (let i = 0; i < 6; i++) {
			agents.push({
				x: Math.random() * canvas.offsetWidth,
				y: Math.random() * canvas.offsetHeight,
				targetX: Math.random() * canvas.offsetWidth,
				targetY: Math.random() * canvas.offsetHeight,
				progress: 0,
				speed: 0.001 + Math.random() * 0.002,
				color: agentColors[Math.floor(Math.random() * agentColors.length)],
				size: 2 + Math.random() * 2, // Smaller, more subtle dots
				pulse: 0
			});
		}
	}

	function drawHexagon(x: number, y: number, size: number, opacity: number) {
		if (!ctx) return;

		const colors = getColors();

		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3;
			const hexX = x + size * Math.cos(angle);
			const hexY = y + size * Math.sin(angle);

			if (i === 0) {
				ctx.moveTo(hexX, hexY);
			} else {
				ctx.lineTo(hexX, hexY);
			}
		}
		ctx.closePath();

		ctx.strokeStyle = colors.hexStroke;
		ctx.lineWidth = 0.5; // Thinner lines for cleaner look
		ctx.stroke();
	}

	function drawAgent(agent: any, time: number) {
		if (!ctx) return;

		// Update agent position
		agent.progress += agent.speed;
		if (agent.progress >= 1) {
			agent.x = agent.targetX;
			agent.y = agent.targetY;
			agent.targetX = Math.random() * canvas.offsetWidth;
			agent.targetY = Math.random() * canvas.offsetHeight;
			agent.progress = 0;
		} else {
			agent.x = agent.x + (agent.targetX - agent.x) * agent.progress;
			agent.y = agent.y + (agent.targetY - agent.y) * agent.progress;
		}

		agent.pulse = Math.sin(time * 0.001 + agent.x * 0.005) * 0.2 + 0.8;

		// Draw subtle agent core only - clean and minimal
		ctx.fillStyle = agent.color;
		ctx.beginPath();
		ctx.arc(agent.x, agent.y, agent.size * (0.7 + agent.pulse * 0.3), 0, Math.PI * 2);
		ctx.fill();
	}

	function activateNearbyHexes(agent: any, time: number) {
		hexGrid.forEach((hex) => {
			const distance = Math.sqrt((hex.x - agent.x) ** 2 + (hex.y - agent.y) ** 2);
			if (distance < 100) {
				hex.active = true;
				hex.activationTime = time;
			} else if (hex.active && time - hex.activationTime > 4000) {
				hex.active = false;
			}
		});
	}

	function animate(time: number) {
		if (!ctx || !canvas || !isVisible) return;

		const colors = getColors();

		// Clear canvas
		ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		// Draw background
		ctx.fillStyle = colors.background;
		ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

		// Draw hexagonal grid
		hexGrid.forEach((hex) => {
			const opacity = hex.active
				? Math.min(hex.opacity * 2, 0.3) * (1 - Math.min((time - hex.activationTime) / 4000, 1))
				: hex.opacity;

			if (opacity > 0.01) {
				drawHexagon(hex.x, hex.y, 15, opacity);
			}
		});

		// Draw subtle connection lines between nearby agents
		for (let i = 0; i < agents.length; i++) {
			for (let j = i + 1; j < agents.length; j++) {
				const distance = Math.sqrt(
					(agents[i].x - agents[j].x) ** 2 + (agents[i].y - agents[j].y) ** 2
				);

				if (distance < 150) {
					const opacity = (1 - distance / 150) * 0.08;
					ctx.strokeStyle = colors.connections.replace(/[\d.]+\)$/, `${opacity})`);
					ctx.lineWidth = 0.3;
					ctx.beginPath();
					ctx.moveTo(agents[i].x, agents[i].y);
					ctx.lineTo(agents[j].x, agents[j].y);
					ctx.stroke();
				}
			}
		}

		// Update and draw agents
		agents.forEach((agent) => {
			activateNearbyHexes(agent, time);
			drawAgent(agent, time);
		});

		// Add very subtle moving particles
		const particleCount = 8;
		for (let i = 0; i < particleCount; i++) {
			const x = ((time * 0.005 + i * 100) % (canvas.offsetWidth + 100)) - 50;
			const y = Math.sin(time * 0.0003 + i) * 20 + canvas.offsetHeight * (i / particleCount);
			const opacity = Math.sin(time * 0.0008 + i) * 0.02 + 0.02;

			ctx.fillStyle = colors.particles.replace(/[\d.]+\)$/, `${opacity})`);
			ctx.beginPath();
			ctx.arc(x, y, 0.5, 0, Math.PI * 2);
			ctx.fill();
		}

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

		// Handle resize with both ResizeObserver and window resize
		const resizeObserver = new ResizeObserver(resizeCanvas);
		resizeObserver.observe(canvas);

		const handleWindowResize = () => {
			// Debounce resize to avoid excessive calls
			clearTimeout(window.resizeTimeout);
			window.resizeTimeout = setTimeout(resizeCanvas, 100);
		};

		window.addEventListener("resize", handleWindowResize);

		// Listen for theme changes to update colors
		const themeObserver = new MutationObserver(() => {
			// Re-render when theme changes
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
