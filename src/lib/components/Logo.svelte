<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	const props: HTMLAttributes<SVGSVGElement> = $props();
</script>

<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="" {...props}>
  <!-- Map Grid Background -->
  <g opacity="0.1">
    <path d="M0 100h500M0 200h500M0 300h500M0 400h500" stroke="currentColor" stroke-width="1"/>
    <path d="M100 0v500M200 0v500M300 0v500M400 0v500" stroke="currentColor" stroke-width="1"/>
  </g>
  
  <!-- Central Location Pin -->
  <g transform="translate(250, 180)">
    <path d="M0 80c-22.091 0-40-17.909-40-40s17.909-40 40-40 40 17.909 40 40c0 22.091-17.909 40-40 40z" fill="currentColor"/>
    <circle cx="0" cy="40" r="15" fill="white"/>
    <path d="M0 80l-20 40h40l-20-40z" fill="currentColor"/>
  </g>
  
  <!-- Agent Nodes -->
  <circle cx="150" cy="120" r="8" fill="currentColor" opacity="0.8"/>
  <circle cx="350" cy="140" r="8" fill="currentColor" opacity="0.8"/>
  <circle cx="120" cy="280" r="8" fill="currentColor" opacity="0.8"/>
  <circle cx="380" cy="300" r="8" fill="currentColor" opacity="0.8"/>
  <circle cx="200" cy="380" r="8" fill="currentColor" opacity="0.8"/>
  <circle cx="320" cy="360" r="8" fill="currentColor" opacity="0.8"/>
  
  <!-- Connection Lines -->
  <g opacity="0.4" stroke="currentColor" stroke-width="2" fill="none">
    <path d="M230 200l-80-80"/>
    <path d="M270 200l80-60"/>
    <path d="M230 220l-110 60"/>
    <path d="M270 220l110 80"/>
    <path d="M240 260l-40 120"/>
    <path d="M260 260l60 100"/>
  </g>
  
  <!-- Hexagonal Pattern Overlay -->
  <g opacity="0.3" stroke="currentColor" stroke-width="1.5" fill="none">
    <polygon points="100,80 120,90 120,110 100,120 80,110 80,90"/>
    <polygon points="380,100 400,110 400,130 380,140 360,130 360,110"/>
    <polygon points="80,320 100,330 100,350 80,360 60,350 60,330"/>
    <polygon points="420,340 440,350 440,370 420,380 400,370 400,350"/>
  </g>
</svg>

