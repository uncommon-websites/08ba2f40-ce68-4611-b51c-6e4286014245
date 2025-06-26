<!--
    @component
    A reusable modal component with backdrop and close functionality.

    Usage:
    ```html
    <Modal bind:open={isOpen}>
      <h2>Modal Title</h2>
      <p>Modal content goes here.</p>
    </Modal>
    ```

    Props:
    - `open`: Boolean to control modal visibility
-->

<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	type Props = {
		open?: boolean;
		onClose?: () => void;
		children?: any;
	};

	let { open = $bindable(false), onClose, children }: Props = $props();

	let dialog: HTMLDialogElement;

	// Handle escape key and backdrop clicks
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			close();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			close();
		}
	}

	function close() {
		open = false;
		onClose?.();
	}

	// Manage dialog state
	$effect(() => {
		if (!browser || !dialog) return;

		if (open) {
			dialog.showModal();
			document.body.style.overflow = "hidden";
		} else {
			dialog.close();
			document.body.style.overflow = "";
		}
	});

	onMount(() => {
		return () => {
			if (browser) {
				document.body.style.overflow = "";
			}
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclick={handleBackdropClick}
	class="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-none w-full h-full"
>
	<div class="flex items-center justify-center min-h-full p-4">
		<div
			class="bg-background border-border relative w-full max-w-md rounded-lg border p-6 shadow-lg"
			onclick={(e) => e.stopPropagation()}
		>
			<button
				onclick={close}
				class="text-muted-foreground hover:text-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				aria-label="Close"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			{@render children?.()}
		</div>
	</div>
</dialog>