<!--
@component MapCanvas
Interactive map canvas with hexagonal grid, animated agents, and geospatial effects
Perfect for Proximity's "Google Maps for agents" concept
-->

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '', ...rest }: Props = $props();

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

	// Colors
	const colors = {
		primary: '#3b82f6',
		secondary: '#8b5cf6',
		accent: '#06b6d4',
		success: '#10b981',
		warning: '#f59e0b',
		grid: 'rgba(59, 130, 246, 0.05)',
		gridActive: 'rgba(59, 130, 246, 0.15)',
		background: 'rgba(248, 250, 252, 0.95)'
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
		
		canvas.style.width = rect.width + 'px';
		canvas.style.height = rect.height + 'px';
		
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
		const agentColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning];
		
		for (let i = 0; i < 6; i++) {
			agents.push({
				x: Math.random() * canvas.offsetWidth,
				y: Math.random() * canvas.offsetHeight,
				targetX: Math.random() * canvas.offsetWidth,
				targetY: Math.random() * canvas.offsetHeight,
				progress: 0,
				speed: 0.001 + Math.random() * 0.002,
				color: agentColors[Math.floor(Math.random() * agentColors.length)],
				size: 3 + Math.random() * 4,
				pulse: 0
			});
		}
	}

	function drawHexagon(x: number, y: number, size: number, opacity: number) {
		if (!ctx) return;
		
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
		
		ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
		ctx.lineWidth = 1;
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
		
		agent.pulse = Math.sin(time * 0.001 + agent.x * 0.005) * 0.3 + 0.7;
		
		// Draw agent trail
		const gradient = ctx.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, agent.size * 2.5);
		gradient.addColorStop(0, agent.color + '20');
		gradient.addColorStop(1, agent.color + '00');
		
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(agent.x, agent.y, agent.size * 2.5, 0, Math.PI * 2);
		ctx.fill();
		
		// Draw agent core
		ctx.fillStyle = agent.color;
		ctx.beginPath();
		ctx.arc(agent.x, agent.y, agent.size * (0.8 + agent.pulse * 0.4), 0, Math.PI * 2);
		ctx.fill();
		
		// Draw agent pulse ring
		ctx.strokeStyle = agent.color + '30';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(agent.x, agent.y, agent.size * (1.5 + agent.pulse * 1), 0, Math.PI * 2);
		ctx.stroke();
	}

	function activateNearbyHexes(agent: any, time: number) {
		hexGrid.forEach(hex => {
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
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		
		// Draw background
		ctx.fillStyle = colors.background;
		ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		
		// Draw hexagonal grid
		hexGrid.forEach(hex => {
			const opacity = hex.active 
				? Math.min(hex.opacity * 2, 0.3) * (1 - Math.min((time - hex.activationTime) / 4000, 1))
				: hex.opacity;
			
			if (opacity > 0.01) {
				drawHexagon(hex.x, hex.y, 15, opacity);
			}
		});
		
		// Draw connection lines between nearby agents
		for (let i = 0; i < agents.length; i++) {
			for (let j = i + 1; j < agents.length; j++) {
				const distance = Math.sqrt(
					(agents[i].x - agents[j].x) ** 2 + (agents[i].y - agents[j].y) ** 2
				);
				
				if (distance < 200) {
					const opacity = (1 - distance / 200) * 0.15;
					ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
					ctx.lineWidth = 0.5;
					ctx.beginPath();
					ctx.moveTo(agents[i].x, agents[i].y);
					ctx.lineTo(agents[j].x, agents[j].y);
					ctx.stroke();
				}
			}
		}
		
		// Update and draw agents
		agents.forEach(agent => {
			activateNearbyHexes(agent, time);
			drawAgent(agent, time);
		});
		
		// Add subtle moving particles
		const particleCount = 12;
		for (let i = 0; i < particleCount; i++) {
			const x = (time * 0.008 + i * 80) % (canvas.offsetWidth + 100) - 50;
			const y = (Math.sin(time * 0.0005 + i) * 30) + (canvas.offsetHeight * (i / particleCount));
			const opacity = Math.sin(time * 0.001 + i) * 0.05 + 0.05;
			
			ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
			ctx.beginPath();
			ctx.arc(x, y, 0.8, 0, Math.PI * 2);
			ctx.fill();
		}
		
		animationId = requestAnimationFrame(animate);
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		
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
		
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			observer.disconnect();
			resizeObserver.disconnect();
		};
	});
</script>

<canvas
	bind:this={canvas}
	class={`absolute inset-0 size-full ${className}`}
	{...rest}
></canvas>