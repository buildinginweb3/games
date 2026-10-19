# Rare Arcade

Three cabinets, one lever. The drum turns on randomness the platform chose
before your transaction was sent, and it lands on one of four things.

| Cabinet | Pull price | Generations Friend | Genesis Friend |
| --- | --- | --- | --- |
| STARTER | 5 USDG | backed by 20 — keep it, or claim 19 | backed by 80 — keep it, or claim 76 |
| CLASSIC | 25 USDG | backed by 100 — keep it, or claim 95 | backed by 400 — keep it, or claim 380 |
| GRAND | 125 USDG | backed by 500 — keep it, or claim 475 | backed by 2,000 — keep it, or claim 1,900 |

Cashback pays 0.95, 4.75 or 23.75 USDG on a gross of 1, 5 or 25 USDG. An empty
pull pays nothing.

## Keep it or take the money

Win a Friend and it lands in your Friend's wallet, backed by USDG. It is yours
to keep — nothing is due, nothing is borrowed, and the backing is simply yours
afterwards.

Or claim the backing instead: burn the Friend and the backing pays out less the
arcade's 5%. That is the whole choice, and it is yours to make after the drum
stops, not before.

## The fee

**5%**, taken in three places: on what you spend, on a cashback win, and on any
backing you choose to claim. Cashback needs no backing of its own — it pays for
itself.

## Backing is a payout, not a valuation

The arcade does not price Rare Friends, and nothing here is an estimate of what
a Friend is worth. "Backed by 20 USDG" means the arcade is willing to pay 20
USDG out of its prize pool for that Friend — a published payout, fixed before
you pull.

That fixed ladder is a deliberate constraint, not an oversight. A Friend's
manifest `redeemValue` is a constant, so a genuinely player-set backing amount
cannot be expressed by a `draw` and `redeem` action. It would need an external
lane and a contract that Rare Friends write. That is not in this version; the
three cabinets are the backing choice this build can honestly make.

## Your Friend decides the odds

The odds are set by your Friend's generation, before you play. Generation 1 is
the rarest Friend and plays the best table; generation 6 the worst. RTP is
computed from the published payouts, not asserted.

| Generation | STARTER | CLASSIC | GRAND |
| --- | --- | --- | --- |
| 1 | 93.48% | 93.10% | 93.10% |
| 2 | 92.26% | 91.80% | 91.77% |
| 3 | 90.93% | 90.47% | 90.44% |
| 4 | 89.56% | 89.18% | 89.07% |
| 5 | 88.35% | 87.85% | 87.74% |
| 6 | 87.13% | 86.56% | 86.41% |

Open **PUBLISHED ODDS** before your first pull to see every outcome and exactly
what each one pays. Those numbers come from the same file that generates the
on-chain registration, so the table you read is the table that settles.

## Open question for Rare Friends

**Does a Friend activated on rarefriends.com stay activated if it is won in a
cabinet?**

This build cannot answer it, and we would rather say so than guess. A cabinet
prize is an in-game item bound to the Friend wallet: this game only ever mints
and burns those items, and it never holds, transfers or deactivates a Rare
Friends NFT. So nothing here should be able to affect an activation — but the
game also has no chain access of its own, so it cannot confirm that either.

If the answer turns out to be no, the fix is an external lane whose contract
Rare Friends write. That is not in this version.
