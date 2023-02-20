<script>
  import { page } from '$app/stores'
</script>

<h1>error {$page.status}</h1>

<p>
  {JSON.stringify($page.error)}
</p>
