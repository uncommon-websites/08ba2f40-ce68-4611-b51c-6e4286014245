<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationId: number;
	let rotation = 0;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		animate();

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});

	function animate() {
		if (!ctx || !canvas) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Set up canvas center
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const radius = Math.min(centerX, centerY) - 20;

		// Save context for rotation
		ctx.save();
		ctx.translate(centerX, centerY);
		ctx.rotate(rotation);

		// Draw world outline (simplified continents)
		ctx.strokeStyle = '#3b82f6';
		ctx.fillStyle = '#1e40af';
		ctx.lineWidth = 2;

		// Draw simplified world map
		drawWorld(ctx, radius);

		// Draw grid lines (hexagonal pattern)
		drawHexGrid(ctx, radius);

		// Restore context
		ctx.restore();

		// Draw outer ring
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
		ctx.strokeStyle = '#60a5fa';
		ctx.lineWidth = 1;
		ctx.stroke();

		// Update rotation
		rotation += 0.005;

		animationId = requestAnimationFrame(animate);
	}

	function drawWorld(ctx: CanvasRenderingContext2D, radius: number) {
		// Simplified world continents as basic shapes
		ctx.beginPath();
		
		// North America (simplified)
		ctx.moveTo(-radius * 0.6, -radius * 0.3);
		ctx.quadraticCurveTo(-radius * 0.4, -radius * 0.6, -radius * 0.2, -radius * 0.4);
		ctx.quadraticCurveTo(-radius * 0.1, -radius * 0.2, -radius * 0.3, 0);
		ctx.quadraticCurveTo(-radius * 0.5, radius * 0.1, -radius * 0.6, -radius * 0.3);

		// Europe/Africa (simplified)
		ctx.moveTo(-radius * 0.1, -radius * 0.4);
		ctx.quadraticCurveTo(radius * 0.1, -radius * 0.5, radius * 0.2, -radius * 0.2);
		ctx.quadraticCurveTo(radius * 0.15, radius * 0.2, radius * 0.05, radius * 0.6);
		ctx.quadraticCurveTo(-radius * 0.05, radius * 0.4, -radius * 0.1, -radius * 0.4);

		// Asia (simplified)
		ctx.moveTo(radius * 0.2, -radius * 0.3);
		ctx.quadraticCurveTo(radius * 0.6, -radius * 0.4, radius * 0.7, -radius * 0.1);
		ctx.quadraticCurveTo(radius * 0.8, radius * 0.2, radius * 0.5, radius * 0.3);
		ctx.quadraticCurveTo(radius * 0.3, radius * 0.1, radius * 0.2, -radius * 0.3);

		ctx.fillStyle = '#1e40af';
		ctx.fill();
		ctx.strokeStyle = '#3b82f6';
		ctx.stroke();
	}

	function drawHexGrid(ctx: CanvasRenderingContext2D, radius: number) {
		ctx.strokeStyle = '#60a5fa';
		ctx.lineWidth = 0.5;
		ctx.globalAlpha = 0.3;

		const hexSize = 30;
		const rows = Math.ceil(radius * 2 / (hexSize * 0.75));
		const cols = Math.ceil(radius * 2 / (hexSize * Math.sqrt(3)));

		for (let row = -rows; row <= rows; row++) {
			for (let col = -cols; col <= cols; col++) {
				const x = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2;
				const y = row * hexSize * 0.75;

				// Only draw hexagons within the circle
				if (Math.sqrt(x * x + y * y) < radius) {
					drawHexagon(ctx, x, y, hexSize * 0.4);
				}
			}
		}

		ctx.globalAlpha = 1;
	}

	function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const angle = (i * Math.PI) / 3;
			const hx = x + size * Math.cos(angle);
			const hy = y + size * Math.sin(angle);
			if (i === 0) {
				ctx.moveTo(hx, hy);
			} else {
				ctx.lineTo(hx, hy);
			}
		}
		ctx.closePath();
		ctx.stroke();
	}
</script>

<section class="py-24 bg-gradient-to-b from-blue-50 to-white">
	<div class="container mx-auto px-4">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold text-gray-900 mb-4">Global agent deployment</h2>
			<p class="text-lg text-gray-600 max-w-2xl mx-auto">
				Watch how agents can be deployed across the globe with our interactive hexagonal grid system
			</p>
		</div>
		
		<div class="flex justify-center">
			<div class="relative">
				<canvas
					bind:this={canvas}
					width="400"
					height="400"
					class="drop-shadow-lg rounded-full bg-white"
				></canvas>
				
				<!-- Floating agent indicators -->
				<div class="absolute top-16 left-16 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
				<div class="absolute top-32 right-20 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
				<div class="absolute bottom-24 left-24 w-3 h-3 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 1s"></div>
				<div class="absolute bottom-16 right-16 w-3 h-3 bg-orange-500 rounded-full animate-pulse" style="animation-delay: 1.5s"></div>
			</div>
		</div>
		
		<div class="text-center mt-8">
			<p class="text-sm text-gray-500">
				Real-time visualization of agent activity across the global hexagonal grid
			</p>
		</div>
	</div>
</section>