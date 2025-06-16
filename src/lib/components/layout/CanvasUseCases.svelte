<!--
@component CanvasUseCases
Interactive canvas-based use cases visualization that showcases Proximity's core value proposition
Features animated agents, interactive hotspots, and compelling use case demonstrations
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import Button from "$lib/components/ui/Button.svelte";
	import SectionHeader from "./SectionHeader.svelte";

	type UseCase = {
		title: string;
		description: string;
		position: { x: number; y: number };
		color: string;
		icon: string;
		benefits: string[];
	};

	type Props = {
		title: string;
		subtitle: string;
		class?: string;
	};

	let { title, subtitle, class: className = '', ...rest }: Props = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationId: number;
	let isVisible = false;
	let hoveredUseCase = $state<number | null>(null);
	let selectedUseCase = $state<number>(0);

	// Use cases data
	const useCases: UseCase[] = [
		{
			title: "Retail site selection",
			description: "Deploy agents across cities to analyze foot traffic, competition, and demographics. Find the perfect location in minutes, not months.",
			position: { x: 0.2, y: 0.3 },
			color: '#3b82f6',
			icon: '🏪',
			benefits: ["3x faster site analysis", "85% accuracy improvement", "Save $50K per location decision"]
		},
		{
			title: "Emergency response",
			description: "Coordinate rescue teams and resources in real-time. Optimize routes and deployment for maximum impact during critical situations.",
			position: { x: 0.7, y: 0.25 },
			color: '#ef4444',
			icon: '🚨',
			benefits: ["40% faster response times", "Real-time coordination", "Lives saved through optimization"]
		},
		{
			title: "Supply chain optimization",
			description: "Visualize global logistics networks and identify bottlenecks instantly. Reroute shipments and optimize delivery schedules on the fly.",
			position: { x: 0.5, y: 0.7 },
			color: '#10b981',
			icon: '📦',
			benefits: ["25% cost reduction", "Real-time visibility", "Automated optimization"]
		}
	];

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
		useCaseIndex: number;
	}> = [];

	let connections: Array<{
		from: { x: number; y: number };
		to: { x: number; y: number };
		opacity: number;
		animated: boolean;
	}> = [];

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
		
		initializeAgents();
		initializeConnections();
	}

	function initializeAgents() {
		if (!canvas) return;
		
		agents = [];
		const width = canvas.offsetWidth;
		const height = canvas.offsetHeight;
		
		// Create agents for each use case
		useCases.forEach((useCase, index) => {
			const centerX = width * useCase.position.x;
			const centerY = height * useCase.position.y;
			
			// Create 3-5 agents per use case
			const agentCount = 3 + Math.floor(Math.random() * 3);
			for (let i = 0; i < agentCount; i++) {
				const angle = (i / agentCount) * Math.PI * 2;
				const radius = 40 + Math.random() * 60;
				
				agents.push({
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius,
					targetX: centerX + Math.cos(angle + 0.5) * (radius + 20),
					targetY: centerY + Math.sin(angle + 0.5) * (radius + 20),
					progress: Math.random(),
					speed: 0.005 + Math.random() * 0.01,
					color: useCase.color,
					size: 2 + Math.random() * 3,
					pulse: Math.random() * Math.PI * 2,
					useCaseIndex: index
				});
			}
		});
	}

	function initializeConnections() {
		if (!canvas) return;
		
		connections = [];
		const width = canvas.offsetWidth;
		const height = canvas.offsetHeight;
		
		// Create connections between use cases
		for (let i = 0; i < useCases.length; i++) {
			for (let j = i + 1; j < useCases.length; j++) {
				connections.push({
					from: {
						x: width * useCases[i].position.x,
						y: height * useCases[i].position.y
					},
					to: {
						x: width * useCases[j].position.x,
						y: height * useCases[j].position.y
					},
					opacity: 0.1,
					animated: false
				});
			}
		}
	}

	function drawAgent(agent: any, time: number) {
		if (!ctx) return;
		
		// Update agent position
		agent.progress += agent.speed;
		if (agent.progress >= 1) {
			const centerX = canvas.offsetWidth * useCases[agent.useCaseIndex].position.x;
			const centerY = canvas.offsetHeight * useCases[agent.useCaseIndex].position.y;
			const angle = Math.random() * Math.PI * 2;
			const radius = 40 + Math.random() * 80;
			
			agent.x = agent.targetX;
			agent.y = agent.targetY;
			agent.targetX = centerX + Math.cos(angle) * radius;
			agent.targetY = centerY + Math.sin(angle) * radius;
			agent.progress = 0;
		} else {
			const easeProgress = 1 - Math.pow(1 - agent.progress, 3);
			agent.x = agent.x + (agent.targetX - agent.x) * easeProgress * 0.02;
			agent.y = agent.y + (agent.targetY - agent.y) * easeProgress * 0.02;
		}
		
		agent.pulse += 0.05;
		const pulseSize = Math.sin(agent.pulse) * 0.3 + 1;
		
		// Enhanced glow for selected use case
		const isSelected = selectedUseCase === agent.useCaseIndex;
		const glowIntensity = isSelected ? 0.4 : 0.2;
		
		// Draw agent glow
		const gradient = ctx.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, agent.size * 4);
		gradient.addColorStop(0, agent.color + Math.floor(glowIntensity * 255).toString(16).padStart(2, '0'));
		gradient.addColorStop(1, agent.color + '00');
		
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(agent.x, agent.y, agent.size * 4, 0, Math.PI * 2);
		ctx.fill();
		
		// Draw agent core
		ctx.fillStyle = agent.color;
		ctx.beginPath();
		ctx.arc(agent.x, agent.y, agent.size * pulseSize, 0, Math.PI * 2);
		ctx.fill();
		
		// Draw selection ring for selected use case
		if (isSelected) {
			ctx.strokeStyle = agent.color + '60';
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.arc(agent.x, agent.y, agent.size * (2 + pulseSize), 0, Math.PI * 2);
			ctx.stroke();
		}
	}

	function drawUseCaseHub(useCase: UseCase, index: number, time: number) {
		if (!ctx) return;
		
		const x = canvas.offsetWidth * useCase.position.x;
		const y = canvas.offsetHeight * useCase.position.y;
		const isSelected = selectedUseCase === index;
		const isHovered = hoveredUseCase === index;
		
		// Hub glow
		const glowSize = isSelected ? 80 : isHovered ? 60 : 40;
		const glowOpacity = isSelected ? 0.3 : isHovered ? 0.2 : 0.15;
		
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
		gradient.addColorStop(0, useCase.color + Math.floor(glowOpacity * 255).toString(16).padStart(2, '0'));
		gradient.addColorStop(1, useCase.color + '00');
		
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(x, y, glowSize, 0, Math.PI * 2);
		ctx.fill();
		
		// Hub core
		const coreSize = isSelected ? 12 : isHovered ? 10 : 8;
		const pulse = Math.sin(time * 0.003 + index) * 0.2 + 1;
		
		ctx.fillStyle = useCase.color;
		ctx.beginPath();
		ctx.arc(x, y, coreSize * pulse, 0, Math.PI * 2);
		ctx.fill();
		
		// Hub ring
		ctx.strokeStyle = useCase.color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, coreSize * pulse + 8, 0, Math.PI * 2);
		ctx.stroke();
	}

	function drawConnections(time: number) {
		if (!ctx) return;
		
		connections.forEach((connection, index) => {
			const opacity = selectedUseCase !== null ? 
				(connection.animated ? 0.4 : 0.05) : 0.1;
			
			// Animated data flow
			if (connection.animated) {
				const flowProgress = (time * 0.002 + index) % 1;
				const flowX = connection.from.x + (connection.to.x - connection.from.x) * flowProgress;
				const flowY = connection.from.y + (connection.to.y - connection.from.y) * flowProgress;
				
				ctx.fillStyle = '#3b82f6';
				ctx.beginPath();
				ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
				ctx.fill();
			}
			
			// Connection line
			ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
			ctx.lineWidth = connection.animated ? 2 : 1;
			ctx.beginPath();
			ctx.moveTo(connection.from.x, connection.from.y);
			ctx.lineTo(connection.to.x, connection.to.y);
			ctx.stroke();
		});
	}

	function animate(time: number) {
		if (!ctx || !canvas || !isVisible) return;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
		
		// Draw background grid
		drawBackgroundGrid();
		
		// Draw connections
		drawConnections(time);
		
		// Draw use case hubs
		useCases.forEach((useCase, index) => {
			drawUseCaseHub(useCase, index, time);
		});
		
		// Draw agents
		agents.forEach(agent => {
			drawAgent(agent, time);
		});
		
		animationId = requestAnimationFrame(animate);
	}

	function drawBackgroundGrid() {
		if (!ctx) return;
		
		const gridSize = 40;
		const width = canvas.offsetWidth;
		const height = canvas.offsetHeight;
		
		ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
		ctx.lineWidth = 0.5;
		
		// Vertical lines
		for (let x = 0; x <= width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		
		// Horizontal lines
		for (let y = 0; y <= height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
	}

	function handleCanvasClick(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		// Check if click is near any use case hub
		useCases.forEach((useCase, index) => {
			const hubX = canvas.offsetWidth * useCase.position.x;
			const hubY = canvas.offsetHeight * useCase.position.y;
			const distance = Math.sqrt((x - hubX) ** 2 + (y - hubY) ** 2);
			
			if (distance < 50) {
				selectedUseCase = index;
				// Animate connections for selected use case
				connections.forEach(connection => {
					connection.animated = Math.random() > 0.5;
				});
			}
		});
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		let newHoveredUseCase: number | null = null;
		
		// Check if mouse is near any use case hub
		useCases.forEach((useCase, index) => {
			const hubX = canvas.offsetWidth * useCase.position.x;
			const hubY = canvas.offsetHeight * useCase.position.y;
			const distance = Math.sqrt((x - hubX) ** 2 + (y - hubY) ** 2);
			
			if (distance < 50) {
				newHoveredUseCase = index;
			}
		});
		
		hoveredUseCase = newHoveredUseCase;
		canvas.style.cursor = hoveredUseCase !== null ? 'pointer' : 'default';
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		
		// Set up intersection observer
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

<section class={`relative overflow-hidden ${className}`} {...rest}>
	<div class="section-px section-py container mx-auto">
		<SectionHeader {title} {subtitle} />
		
		<div class="mt-16 grid gap-8 lg:grid-cols-[2fr_1fr] lg:gap-16">
			<!-- Interactive Canvas -->
			<div class="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 relative h-[500px] overflow-hidden rounded-(--radius-xl) border lg:h-[600px]">
				<canvas
					bind:this={canvas}
					class="absolute inset-0 size-full"
					onclick={handleCanvasClick}
					onmousemove={handleCanvasMouseMove}
				></canvas>
				
				<!-- Overlay Instructions -->
				<div class="absolute top-4 left-4 right-4 z-10">
					<div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-(--radius) border p-4 shadow-sm">
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">
							Click on the glowing hubs to explore different use cases
						</p>
					</div>
				</div>
			</div>
			
			<!-- Use Case Details -->
			<div class="space-y-6">
				<div class="bg-card border-border rounded-(--radius-lg) border p-6">
					<div class="mb-4 flex items-center gap-3">
						<div 
							class="flex size-12 items-center justify-center rounded-full text-2xl"
							style="background-color: {useCases[selectedUseCase].color}20; color: {useCases[selectedUseCase].color}"
						>
							{useCases[selectedUseCase].icon}
						</div>
						<h3 class="text-title2 font-semibold">{useCases[selectedUseCase].title}</h3>
					</div>
					
					<p class="text-body text-muted-foreground mb-6">
						{useCases[selectedUseCase].description}
					</p>
					
					<div class="space-y-3">
						<h4 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							Key Benefits
						</h4>
						<ul class="space-y-2">
							{#each useCases[selectedUseCase].benefits as benefit}
								<li class="flex items-center gap-2 text-sm">
									<div 
										class="size-2 rounded-full"
										style="background-color: {useCases[selectedUseCase].color}"
									></div>
									{benefit}
								</li>
							{/each}
						</ul>
					</div>
					
					<div class="mt-6">
						<Button href="/get-started" variant="primary" size="sm">
							Try this use case
						</Button>
					</div>
				</div>
				
				<!-- Use Case Selector -->
				<div class="space-y-2">
					{#each useCases as useCase, index}
						<button
							class="hover:bg-muted/50 flex w-full items-center gap-3 rounded-(--radius) p-3 text-left transition-colors"
							class:bg-muted={selectedUseCase === index}
							onclick={() => selectedUseCase = index}
						>
							<div 
								class="flex size-8 items-center justify-center rounded-full text-sm"
								style="background-color: {useCase.color}20; color: {useCase.color}"
							>
								{useCase.icon}
							</div>
							<span class="text-sm font-medium">{useCase.title}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Bottom CTA -->
		<div class="mt-16 text-center">
			<div class="bg-gradient-to-r from-blue-600 to-purple-600 mx-auto max-w-2xl rounded-(--radius-xl) p-8 text-white">
				<h3 class="text-title1 mb-4 font-bold">Ready to deploy your agents?</h3>
				<p class="text-blue-100 mb-6">
					Join data teams at leading companies who are already using Proximity to transform their geospatial analysis.
				</p>
				<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button href="/get-started" variant="secondary" size="lg">
						Start free trial
					</Button>
					<Button href="/demo" variant="ghost" size="lg" class="text-white border-white/20 hover:bg-white/10">
						Watch demo
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>