<script lang="ts">
	type Props = {
		title: string;
		subtitle?: string;
		sections: {
			id: string;
			title: string;
			icon?: string;
		}[];
		children: any;
	};

	let { title, subtitle, sections, children }: Props = $props();

	let activeSection = $state(sections[0]?.id || "");

	// Handle section navigation
	function scrollToSection(sectionId: string) {
		activeSection = sectionId;
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	}
</script>

<div class="min-h-screen bg-white">
	<!-- Header -->
	<div class="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-6">
					<!-- Logo/Brand -->
					<div class="flex items-center space-x-2">
						<div class="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
							<span class="text-white text-xs font-bold">P</span>
						</div>
						<span class="font-semibold text-gray-900">Proximity</span>
					</div>
					
					<!-- Navigation -->
					<nav class="hidden md:flex items-center space-x-6">
						<a href="/product" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Product</a>
						<a href="/resources" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Resources</a>
						<a href="/pricing" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
						<a href="/customers" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Customers</a>
						<a href="/blog" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
						<a href="/contact" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
					</nav>
				</div>
				
				<div class="flex items-center space-x-4">
					<a href="/docs" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
					<button class="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
						Open app
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto flex max-w-7xl">
		<!-- Sidebar Navigation -->
		<div class="sticky top-16 min-h-screen w-80 border-r border-gray-100 bg-gray-50/50">
			<div class="p-6">
				<div class="mb-4">
					<span class="text-xs font-medium tracking-wide text-gray-500 uppercase">
						SWITCH INSTRUCTION MANUAL
					</span>
					<div class="flex items-center space-x-2 mt-2">
						<span class="text-xs text-gray-400">[↗]</span>
						<span class="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">PDF</span>
					</div>
				</div>
				<h1 class="mb-2 text-2xl font-semibold text-gray-900">{title}</h1>
				{#if subtitle}
					<p class="mb-8 text-sm text-gray-600">{subtitle}</p>
				{/if}

				<nav class="space-y-2">
					{#each sections as section}
						<button
							onclick={() => scrollToSection(section.id)}
							class="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
							class:bg-white={activeSection === section.id}
							class:text-gray-900={activeSection === section.id}
							class:text-gray-600={activeSection !== section.id}
							class:hover:bg-white={activeSection !== section.id}
							class:hover:text-gray-900={activeSection !== section.id}
						>
							{#if section.icon}
								<span class="text-gray-400">{section.icon}</span>
							{/if}
							<span>{section.title}</span>
						</button>
					{/each}
				</nav>
			</div>
		</div>

		<!-- Main Content -->
		<div class="max-w-4xl flex-1">
			<div class="p-12">
				{@render children()}
			</div>
		</div>
	</div>
</div>
