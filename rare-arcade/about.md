# Rare Arcade

Rare Arcade is a marketplace of player-built prize machines.

Anyone can open a cabinet, stock it with Rare Friends and USDG, set the pull
price and the number of tickets, and put it on the floor. Players pull one
ticket at a time from a shuffled finite deck. A ticket can carry a Rare Friend,
a USDG prize, or nothing.

## Open your own machine

- Stock up to 16 Rare Friends from your wallet. Each one gets a USDG backing you
  choose, held by the machine until someone wins it.
- Add up to 8 USDG prize lines, with up to 20 copies of each.
- Set a price from 0.1 to 1,000 USDG and 2 to 1,000 tickets.
- Choose a CLASSIC, CAPSULE, TALLBOY or MINI cabinet.
- Check the floor RTP before you publish. It must be between 70% and 105%.

You can pause and resume a machine, collect your receipts whenever you like, or
cancel it before its first pull to get the remaining USDG and the Friends back.
After the first pull the deck is locked for the players.

## Play

1. Pick a machine and check its price, tickets left, prize pool, top backing and
   published floor RTP.
2. Pull the lever. You pay the machine's price.
3. If the ticket carries USDG, it is paid to you immediately.
4. If it carries a Rare Friend, the Friend goes to your Friend wallet. Keep it,
   or open **Claims** and take its USDG backing. Taking the money burns the
   Friend; keeping it is always your choice.

Every ticket is drawn exactly once. The floor shows how many tickets remain, so
you always know what is left in the deck.

## The fee

The platform keeps **5% of every pull**. The creator receives the other **95%**.
There is no fee on a claim: taking a Friend's backing pays the full amount its
creator attached.

## Backing is a payout

The arcade does not value Rare Friends. "Backed by 10 USDG" means the machine
pays 10 USDG if you choose to burn that Friend — a published payout fixed before
the pull, not an estimate of what the Friend is worth.

## Status

Rare Arcade 0.2.0 is built on a FriendSDK **external lane**. The marketplace
needs a contract that can escrow Rare Friends, hold the USDG prize pool, settle
a finite deck, pay backing on burn, split each pull 95/5 and refund a cancelled
machine. The SDK does not deploy that contract for external games.

This repository includes `dev/arcade-stub.ts`, an executable dev version of the
full contract, relay and watcher. The game runs end to end against it in the
FriendSDK dev host. Before mainnet, Rare Friends must author and deploy the
production contract, adapter and watcher. Until that happens this is a dev
build and should not be used with real funds or real Rare Friends.
