# Rare Friends Games

Every game in the [Rare Friends arcade](https://rarefriends.com/play) is served from this repository at
`https://play.rarefriends.com/<id>/<version>/`. To add a game, or ship an update, open a pull request here.

Games are built with [FriendSDK 1.0](https://github.com/rarefriends/friendsdk). Read its README first: the SDK runs your
game with simulated Friends, wallets, contracts and server (`npx friendsdk dev`), so you can finish and test everything
before you submit.

## Layout

```
games.json                  every published version, written by `friendsdk site`
<id>/
  listing.json              arcade card and credits
  about.md                  the game page's About tab
  thumbnail.webp            arcade card art
  <version>/                the `client/` folder from `friendsdk build`, never edited after it is merged
```

`<id>` is the `id` in your `friendsdk.json`: 2–32 characters of `a-z`, `0-9` and `-`, starting with a letter.

## Submit a game

1. **Build.** In your game: `npx friendsdk check`, then `npx friendsdk build`. This writes `.friendsdk/build/`.
2. **Fork and clone this repository.**
3. **Add the build.** From your game's folder:

   ```sh
   npx friendsdk site --out ../games .friendsdk/build
   ```

   This copies `.friendsdk/build/client` to `<id>/<version>/` and adds the version to `games.json`.
4. **Add your listing** to `<id>/`:

   - `listing.json`

     ```json
     {
       "title": "My Game",
       "category": "Puzzle",
       "developer": {
         "name": "yourname",
         "x": "https://x.com/yourname",
         "discord": "https://discord.gg/invite",
         "github": "https://github.com/yourname"
       },
       "source": "https://github.com/yourname/my-game"
     }
     ```

     `title`, `category` and `developer.name` are required. Leave out any link you don't have.
     `source` is a public link to the game's source code. It is required when the game has server rules or paid actions.
   - `about.md`: what the game is and how to play, in GitHub Markdown. Raw HTML is not shown.
   - `thumbnail.webp`: 16:9 WebP, about 1672 × 941, at most 512 KB. Rare Friends may restyle it to match the arcade.

5. **Check**, then open a pull request:

   ```sh
   node scripts/check.mjs --base origin/main
   ```

## Update a game

Bump `version` in `friendsdk.json`, build, and run `friendsdk site` again. Published versions never change; each update
is a new folder. Edit `listing.json`, `about.md` or `thumbnail.webp` in the same pull request if they changed.

## Review and launch

Rare Friends reviews each pull request: we play the build and read the source. After the merge:

1. The new version goes live on `play.rarefriends.com`.
2. Server rules (`"server"` in `friendsdk.json`) are deployed to the Rare Friends game server from the linked source.
3. Paid actions are registered on the Rare Friends platform contracts once the terms are agreed with you. Until then
   the game's free features run and its paid actions show as not yet available.
4. The game is added to the arcade, or the arcade switches to the new version.

Questions: open an issue.

## Rules

`scripts/check.mjs` runs on every pull request and enforces:

- One game per pull request.
- Version folders contain only what `friendsdk build` writes: `index.html`, `friendsdk.json`, `game.js`, `game.css`,
  and assets (images, fonts, audio, video, JSON, models, WebAssembly). No other HTML or scripts.
- `index.html` is exactly the document `friendsdk build` writes, including its Content Security Policy.
- `friendsdk.json` `id` and `version` match the folder.
- New versions are newer than the latest published one. Published files are never modified or removed.
- At most 10 MB per file and 50 MB per version.
- `vercel.json`, `scripts/`, `.github/` and this README are maintained by Rare Friends.

## Test against a local website

`serve-local.mjs` serves this folder over HTTPS with the same headers as `play.rarefriends.com`:

```sh
node serve-local.mjs cert.pem key.pem 3005 "https://localhost:3000"
```

## Ownership

Each game belongs to its developer. Opening a pull request allows Rare Friends to host the game here and list it in
the arcade.
