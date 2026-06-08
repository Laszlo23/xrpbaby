# Hosting the community guide on every hostname

The canonical community markdown lives at [`b3/content/community-guide.md`](../content/community-guide.md). Each web surface imports it and renders **`/guide`**:

| Surface | Location in repo |
|---------|------------------|
| Umbrella (`home.buildingcultureid.space`) | [`b3/umbrella`](../umbrella/) — route `/guide` |
| Eco (`eco.buildingcultureid.space`) | [`b3/ecorwa`](../ecorwa/) — route `/guide` |
| BUILDCHAIN (`0x` / `app`) | [`b3/frontend`](../frontend/) — route `/guide` |

## Apex domain (`buildingcultureid.space`)

The apex site may be a separate marketing deploy outside this monorepo. To give visitors the **same** guide:

**Option A — redirect (simplest)**  
In nginx for `buildingcultureid.space`:

```nginx
location = /guide {
    return 302 https://home.buildingcultureid.space/guide;
}
```

**Option B — same SPA as home**  
Point apex `/` at the same umbrella static build as `home.buildingcultureid.space` if you want identical pages (coordinate cache headers separately).

After changing nginx, run `nginx -t` and reload.
