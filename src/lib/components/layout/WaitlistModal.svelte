<!--
    @component
    Waitlist signup modal with email form.

    Usage:
    ```html
    <WaitlistModal bind:open={showWaitlist} />
    ```
-->

<script lang="ts">
	import Modal from "../ui/Modal.svelte";
	import Button from "../ui/Button.svelte";

	type Props = {
		open?: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	let email = $state("");
	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let error = $state("");

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!email) {
			error = "Please enter your email address";
			return;
		}

		if (!email.includes("@")) {
			error = "Please enter a valid email address";
			return;
		}

		isSubmitting = true;
		error = "";

		try {
			// Simulate API call - replace with actual endpoint
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			isSubmitted = true;
			email = "";
		} catch (err) {
			error = "Something went wrong. Please try again.";
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		open = false;
		// Reset form state when modal closes
		setTimeout(() => {
			isSubmitted = false;
			error = "";
			email = "";
		}, 300);
	}
</script>

<Modal bind:open onClose={handleClose}>
	<div class="space-y-6">
		{#if !isSubmitted}
			<div class="space-y-2">
				<h2 class="text-title2">Join the waitlist</h2>
				<p class="text-muted-foreground text-body">
					Be the first to know when Proximity launches. Get early access to deploy AI agents on a global map.
				</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<label for="email" class="text-sm font-medium">Email address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Enter your email"
						disabled={isSubmitting}
						class="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					/>
					{#if error}
						<p class="text-sm text-red-600">{error}</p>
					{/if}
				</div>

				<div class="flex gap-3">
					<Button
						type="submit"
						variant="primary"
						disabled={isSubmitting}
						class="flex-1"
					>
						{isSubmitting ? "Joining..." : "Join waitlist"}
					</Button>
					<Button
						type="button"
						variant="ghost"
						onclick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</div>
			</form>
		{:else}
			<div class="text-center space-y-4">
				<div class="text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div class="space-y-2">
					<h2 class="text-title3">You're on the list!</h2>
					<p class="text-muted-foreground text-body">
						Thanks for joining our waitlist. We'll notify you as soon as Proximity is ready.
					</p>
				</div>
				<Button onclick={handleClose} variant="primary" class="w-full">
					Done
				</Button>
			</div>
		{/if}
	</div>
</Modal>