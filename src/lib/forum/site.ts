// WargameCompare's forum settings (the rules are in ./core.ts, docs/forum.md).
import { SITE_DOMAIN } from "@/lib/site";
import type { ForumSite } from "./core";

export const FORUM_SITE: ForumSite = {
  site: "wargamecompare",
  siteName: "WargameCompare",
  repo: "Specifxx/wargamecompare",
  hosts: [SITE_DOMAIN, `www.${SITE_DOMAIN}`],
  base: "/forum",
  topic: "miniature wargames",
  intro: "Talk miniature prices, deals, armies and the hobby with other players.",
  categories: [
    { key: "new-releases", name: "New releases & pre-orders", blurb: "What's coming, what it costs and where to pre-order it for less.", prompts: ["Is the new Combat Patrol worth it?", "Cheapest place to pre-order this week's release?"] },
    { key: "deals", name: "Deals & where to buy", blurb: "Good prices you spotted, discount stores and shipping tips.", prompts: ["Which discount store shipped fastest for you?", "Best Combat Patrol price you've seen"] },
    { key: "armies", name: "Armies & lists", blurb: "Starting an army on a budget, lists and what to buy first.", prompts: ["Best value way to start Space Marines?", "Which boxes give the most points per dollar?"] },
    { key: "hobby", name: "Painting & hobby", blurb: "Paints, brushes, tools and terrain: what's worth the money.", prompts: ["Best value paint set for a beginner?", "Which brushes last the longest?"] },
    { key: "site", name: "Site feedback", blurb: "Ideas, bugs or a store we should add.", prompts: ["A store we should compare"] },
  ],
  reserved: ["wargame compare", "games workshop"],
};
