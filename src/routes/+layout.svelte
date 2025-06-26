<script lang="ts">
	// Styles
	import "../app.css";

	// Components
	import Logo from "$lib/components/Logo.svelte";
	import Nav from "$lib/components/layout/Nav.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";

	// Utils
	import { onMount } from "svelte";
	import { animate, inView, stagger } from "motion";

	import { MediaQuery } from "svelte/reactivity";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { CONFIG } from "$lib/content";
	import { navHeight } from "$lib/state/nav.svelte";

	const isTouchDevice = new MediaQuery("(pointer: coarse)");

	// Props
	let { data, children } = $props();

	// Check if we're on the homepage for single-screen layout
	const isHomepage = $derived($page.route?.id === "/");

	// onMount(() => {
	// 	if (!browser) return;
	// 	const enterContainers = document.querySelectorAll("[data-enter-container]");

	// 	enterContainers?.forEach((container) => {
	// 		const elements = container.querySelectorAll("[data-enter]");

	// 		elements.forEach((element) => {
	// 			(element as HTMLElement).style.opacity = "0";
	// 		});
	// 	});

	// 	inView("[data-enter-container]", (e) => {
	// 		animate(
	// 			e.querySelectorAll("[data-enter]"),
	// 			{
	// 				opacity: [0, 1],
	// 				y: ["2rem", 0]
	// 			},
	// 			{
	// 				duration: 0.4,
	// 				ease: "circOut",
	// 				delay: stagger(0.15, {
	// 					ease: "easeInOut"
	// 				})
	// 			}
	// 		);
	// 	});
	// });
</script>

<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content={data.meta.description} />
	<meta name="author" content={data.meta.companyName} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={data.meta.image} />
	<meta property="og:url" content={data.meta.url} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />
	<meta name="twitter:image" content={data.meta.image} />

	<title>{data.meta.title}</title>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<!-- <link
		href="https://fonts.googleapis.com/css2?family={encodeURIComponent(
			page.data.meta.fontFamily
		)}:ital,wght@0,400..800;1,400..800&display=swap"
		rel="stylesheet"
	/> -->
	<link
		href="https://fonts.googleapis.com/css2?family={encodeURIComponent(
			CONFIG.fontFamily
		)}&display=swap"
		rel="stylesheet"
	/>

	<!-- eslint-disable -->
	{@html `
    	<style>
    	   :root {
    			--font-family: "${CONFIG.fontFamily}";
                --font-body: var(--font-family), var(--font-fallback);
    		}
    	</style>
	`}
</svelte:head>

<div
	style:--nav-height="{navHeight.current}px"
	class="isolate bg-inherit"
	class:touch={isTouchDevice.current === true}
	class:no-touch={isTouchDevice.current !== true}
>
	<Nav />

	{@render children()}

	{#if !isHomepage}
		<Footer />
	{/if}
</div>
