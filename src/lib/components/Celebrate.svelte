<script lang="ts">
	import type { Game } from "$lib/Game/game.svelte";

	let { game }: { game: Game } = $props();
</script>

<div popover>
  <header>
    Congratulations!
  </header>
</div>
