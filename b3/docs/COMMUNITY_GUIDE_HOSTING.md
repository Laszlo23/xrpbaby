# Hosting the community guide on every hostname

The canonical community markdown lives at [`b3/content/community-guide.md`](../content/community-guide.md). Each web surface imports it and renders **`/guide`**:

| Surface | Location in repo |
|---------|------------------|
| Umbrella (`home.buildingculture.capital`) | [`b3/umbrella`](../umbrella/) — route `/guide` |
| Eco (`eco.buildingculture.capital`) | [`b3/ecorwa`](../ecorwa/) — route `/guide` |
| BUILDCHAIN (`0x` / `app`) | [`b3/frontend`](../frontend/) — route `/guide` |

## Apex domain (`buildingculture.capital`)

The apex site may be a separate marketing deploy outside this monorepo. To give visitors the **same** guide:

**Option A — redirect (simplest)**  
In nginx for `buildingculture.capital`:

```nginx
location = /guide {
    return 302 https://home.buildingculture.capital/guide;
}
```

**Option B — same SPA as home**  
Point apex `/` at the same umbrella static build as `home.buildingculture.capital` if you want identical pages (coordinate cache headers separately).

After changing nginx, run `nginx -t` and reload.
