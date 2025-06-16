<!--
@component CanvasUseCases
Clean, modern use cases section that showcases Proximity's core value proposition
Features beautiful visual design and interactive use case demonstrations
-->

<script lang="ts">
	import Button from "$lib/components/ui/Button.svelte";
	import SectionHeader from "./SectionHeader.svelte";

	// Icons
	import StoreIcon from "~icons/lucide/store";
	import AlertTriangleIcon from "~icons/lucide/alert-triangle";
	import TruckIcon from "~icons/lucide/truck";
	import MapPinIcon from "~icons/lucide/map-pin";
	import UsersIcon from "~icons/lucide/users";
	import BarChart3Icon from "~icons/lucide/bar-chart-3";

	type UseCase = {
		title: string;
		description: string;
		color: string;
		icon: any;
		benefits: string[];
		stats: {
			label: string;
			value: string;
		}[];
	};

	type Props = {
		title: string;
		subtitle: string;
		class?: string;
	};

	let { title, subtitle, class: className = '', ...rest }: Props = $props();

	let selectedUseCase = $state<number>(0);

	// Use cases data
	const useCases: UseCase[] = [
		{
			title: "Retail site selection",
			description: "Deploy agents across cities to analyze foot traffic, competition, and demographics. Find the perfect location in minutes, not months.",
			color: '#007AFF',
			icon: StoreIcon,
			benefits: ["3x faster site analysis", "85% accuracy improvement", "Save $50K per location decision"],
			stats: [
				{ label: "Analysis time", value: "2 hours" },
				{ label: "Accuracy rate", value: "94%" },
				{ label: "Cost savings", value: "$50K+" }
			]
		},
		{
			title: "Emergency response",
			description: "Coordinate rescue teams and resources in real-time. Optimize routes and deployment for maximum impact during critical situations.",
			color: '#FF3B30',
			icon: AlertTriangleIcon,
			benefits: ["40% faster response times", "Real-time coordination", "Lives saved through optimization"],
			stats: [
				{ label: "Response time", value: "12 min" },
				{ label: "Team coordination", value: "Real-time" },
				{ label: "Coverage area", value: "500 km²" }
			]
		},
		{
			title: "Supply chain optimization",
			description: "Visualize global logistics networks and identify bottlenecks instantly. Reroute shipments and optimize delivery schedules on the fly.",
			color: '#34C759',
			icon: TruckIcon,
			benefits: ["25% cost reduction", "Real-time visibility", "Automated optimization"],
			stats: [
				{ label: "Cost reduction", value: "25%" },
				{ label: "Delivery time", value: "2.3 days" },
				{ label: "Route efficiency", value: "89%" }
			]
		}
	];
</script>

<section class={`relative overflow-hidden ${className}`} {...rest}>
	<div class="px-6 py-24 container mx-auto max-w-7xl">
		<SectionHeader {title} {subtitle} />
		
		<div class="mt-16 grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
			<!-- Visual Showcase -->
			<div class="relative">
				<!-- Main Visual Card -->
				<div class="relative h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 lg:h-[600px]">
					<!-- Background Pattern -->
					<div class="absolute inset-0 opacity-30">
						<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
							<defs>
								<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
									<path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5" class="text-gray-300 dark:text-gray-600"/>
								</pattern>
							</defs>
							<rect width="100" height="100" fill="url(#grid)" />
						</svg>
					</div>
					
					<!-- Agent Nodes -->
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="relative w-80 h-80">
							<!-- Central Hub -->
							<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
								<div 
									class="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center transition-all duration-500"
									style="background-color: {useCases[selectedUseCase].color}"
								>
									<svelte:component this={useCases[selectedUseCase].icon} class="w-8 h-8 text-white" />
								</div>
								<!-- Pulse Animation -->
								<div 
									class="absolute inset-0 rounded-full animate-ping opacity-20"
									style="background-color: {useCases[selectedUseCase].color}"
								></div>
							</div>
							
							<!-- Satellite Nodes -->
							{#each Array(6) as _, i}
								<div 
									class="absolute w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-md transition-all duration-500"
									style="
										background-color: {useCases[selectedUseCase].color}; 
										top: {50 + 35 * Math.sin((i * 60) * Math.PI / 180)}%; 
										left: {50 + 35 * Math.cos((i * 60) * Math.PI / 180)}%;
										transform: translate(-50%, -50%);
										animation-delay: {i * 100}ms;
									"
								>
									<div class="w-full h-full rounded-full animate-pulse opacity-60"></div>
								</div>
							{/each}
							
							<!-- Connection Lines -->
							{#each Array(6) as _, i}
								<svg class="absolute inset-0 w-full h-full">
									<line 
										x1="50%" 
										y1="50%" 
										x2="{50 + 35 * Math.cos((i * 60) * Math.PI / 180)}%" 
										y2="{50 + 35 * Math.sin((i * 60) * Math.PI / 180)}%" 
										stroke={useCases[selectedUseCase].color} 
										stroke-width="2" 
										opacity="0.3"
										class="transition-all duration-500"
									/>
								</svg>
							{/each}
						</div>
					</div>
					
					<!-- Floating Stats -->
					<div class="absolute top-8 left-8 right-8">
						<div class="grid grid-cols-3 gap-4">
							{#each useCases[selectedUseCase].stats as stat}
								<div class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 text-center">
									<div class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
									<div class="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
								</div>
							{/each}
						</div>
					</div>
					
					<!-- Bottom Info -->
					<div class="absolute bottom-8 left-8 right-8">
						<div class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
							<div class="flex items-center gap-3">
								<div 
									class="w-3 h-3 rounded-full"
									style="background-color: {useCases[selectedUseCase].color}"
								></div>
								<p class="text-sm font-medium text-gray-900 dark:text-white">
									{useCases[selectedUseCase].title} in action
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Use Case Details -->
			<div class="space-y-8">
				<!-- Main Details Card -->
				<div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
					<div class="mb-8">
						<div class="flex items-center gap-4 mb-6">
							<div 
								class="w-12 h-12 rounded-xl flex items-center justify-center"
								style="background-color: {useCases[selectedUseCase].color}15"
							>
								<svelte:component this={useCases[selectedUseCase].icon} 
									class="w-6 h-6" 
									style="color: {useCases[selectedUseCase].color}" 
								/>
							</div>
							<div>
								<h3 class="text-2xl font-semibold text-gray-900 dark:text-white">{useCases[selectedUseCase].title}</h3>
								<div class="flex items-center gap-2 mt-1">
									<div 
										class="w-2 h-2 rounded-full"
										style="background-color: {useCases[selectedUseCase].color}"
									></div>
									<span class="text-sm text-gray-500 dark:text-gray-400">Active use case</span>
								</div>
							</div>
						</div>
						<p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
							{useCases[selectedUseCase].description}
						</p>
					</div>
					
					<div class="space-y-6">
						<h4 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<BarChart3Icon class="w-4 h-4" />
							Key benefits
						</h4>
						<ul class="space-y-4">
							{#each useCases[selectedUseCase].benefits as benefit}
								<li class="flex items-center gap-4 text-gray-600 dark:text-gray-400">
									<div 
										class="w-1.5 h-1.5 rounded-full flex-shrink-0"
										style="background-color: {useCases[selectedUseCase].color}"
									></div>
									{benefit}
								</li>
							{/each}
						</ul>
					</div>
					
					<div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
						<Button href="/get-started" variant="primary" size="md" class="w-full">
							Try this use case
						</Button>
					</div>
				</div>
				
				<!-- Use Case Selector -->
				<div class="space-y-3">
					<h4 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
						<MapPinIcon class="w-4 h-4" />
						Explore use cases
					</h4>
					{#each useCases as useCase, index}
						<button
							class="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
							class:bg-gray-50={selectedUseCase === index}
							class:dark:bg-gray-800/50={selectedUseCase === index}
							onclick={() => selectedUseCase = index}
						>
							<div 
								class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
								style="background-color: {selectedUseCase === index ? useCase.color + '20' : 'transparent'}"
							>
								<svelte:component this={useCase.icon} 
									class="w-5 h-5 transition-all duration-200" 
									style="color: {useCase.color}" 
								/>
							</div>
							<div class="flex-1">
								<span class="text-base font-medium text-gray-900 dark:text-white block">{useCase.title}</span>
								<span class="text-sm text-gray-500 dark:text-gray-400">Click to explore</span>
							</div>
							<div 
								class="w-2 h-2 rounded-full transition-all duration-200"
								style="background-color: {selectedUseCase === index ? useCase.color : 'transparent'}"
							></div>
						</button>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Enhanced Bottom Section -->
		<div class="mt-24">
			<div class="mx-auto max-w-4xl">
				<div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center">
					<div class="flex items-center justify-center gap-3 mb-6">
						<UsersIcon class="w-8 h-8 text-blue-600" />
						<h3 class="text-3xl font-semibold text-gray-900 dark:text-white">Start deploying agents today</h3>
					</div>
					<p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
						Transform your geospatial analysis workflow with intelligent agents that work across any location on the globe. No GIS expertise required.
					</p>
					<div class="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
						<Button href="/get-started" variant="primary" size="lg">
							Get started free
						</Button>
						<Button href="/demo" variant="secondary" size="lg">
							Watch demo
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>