# Rare Arcade

Rare Arcade is a marketplace of player-built prize machines for any NFT on
Robinhood Chain.

Anyone can open a cabinet, stock it with NFTs and USDG, set the pull price and
the number of tickets, and put it on the floor. Players pull one ticket at a
time from a shuffled finite deck. A ticket can carry an NFT, a USDG prize, or
nothing. The creator keeps **95%** of every pull; the platform keeps **5%**.

## Open your own machine

- Stock up to 16 NFTs. Enter each collection's `0x` contract, its decimal token
  id and whether it is ERC-721 or ERC-1155. Add a USDG backing to each one.
- Add up to 8 USDG prize lines, with up to 20 copies of each.
- Set a price from 0.1 to 1,000 USDG and 2 to 1,000 tickets.
- Choose a CLASSIC, CAPSULE, TALLBOY or MINI cabinet.
- Check the floor RTP before you publish. It must be between 70% and 105%.

You can pause and resume a machine, collect your receipts whenever you like, or
cancel it before its first pull to get the remaining USDG and the NFTs back.
After the first pull the deck is locked for the players.

## Play

1. Pick a machine and check its price, tickets left, prize pool, top backing and
   published floor RTP.
2. Pull the lever. You pay the machine's price.
3. If the ticket carries USDG, it is paid to you immediately.
4. If it carries an NFT, the NFT stays in the machine's escrow. Open **Claims**
   and choose: **keep the NFT** and it moves to your Friend wallet, or **take the
   backing** and you receive its full USDG backing while the NFT returns to its
   creator. Nothing is burned.

Every ticket is drawn exactly once. The floor shows how many tickets remain, so
you always know what is left in the deck.

## The fee

The platform keeps **5% of every pull**. The creator receives the other **95%**.
There is no fee on a win or a claim. Keeping an NFT returns its backing to the
creator; taking the backing pays the full amount the creator attached.

## Backing is a payout

The arcade does not value NFTs. "Backed by 10 USDG" means the machine pays
10 USDG if the winner chooses the backing instead of the NFT — a published
payout fixed before the pull, not an estimate of what the NFT is worth.

## Status

Rare Arcade 0.3.0 is built on a FriendSDK **external lane**. The marketplace
needs a contract that can verify and escrow arbitrary NFTs, hold the USDG prize
and backing pools, settle a finite deck, transfer on keep, return on claim or
cancel, split each pull 95/5 and refund a cancelled machine. The SDK does not
deploy that contract for external games.

This repository includes `dev/arcade-stub.ts`, an executable dev version of the
full contract, relay and watcher. The game runs end to end against it in the
FriendSDK dev host. Before mainnet, Rare Friends must author and deploy the
production contract, adapter and watcher. Until that happens this is a dev
build and should not be used with real funds or real NFTs.
