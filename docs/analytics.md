# Analytics

The pages use Google Analytics' `gtag.js`, which reports to the Firebase project `blitzsplit-site` (measurement id
`G-JD94WD10FJ`): a project of its own, so the site's visits don't mix with the app's numbers (the app's project is
`blitz-split`).

`public/analytics.js`, loaded with `defer` in every page's `<head>`, sets up Google Analytics and gives the other
scripts `window.track(name, params)`. It adds `gtag.js` itself only once the page has loaded, so the page's heaviest
script never competes with what the visitor is waiting to see; the page view and any event sent before it arrives
wait in `dataLayer`. Google Analytics' own events (`page_view`, `scroll`,
outbound `click`, `first_visit`, `session_start`) stay as they are. An app link's group code, member, bill and comment
ids and a profile's code never reach Analytics, as the privacy policy promises: on `/g/…`, `/b/…` and `/u/…`, `page_location` and `page_referrer`
keep only `/g/`, `/b/` or `/u/` and drop `?comentario=`. The events, after Bible Planner's landing:

| Event | When | Parameters |
| --- | --- | --- |
| `app_link_view` | The page opens from an app link | `kind`: `group_invite`, `member_invite`, `bill_comment`, `profile_link` |
| `traffic_source` | The page opens with `utm_source`, once per visit for the same values | `source`, `medium`, `campaign`, `term`, `content` (each when present, up to 100 characters) |
| `store_click` | A store's badge or the header's button | `store`: `play`, `appstore`, `web`; `origin`: `hero`, `cta`, `header`, `header_menu`; `platform`: `android`, `ios`, `mac`, `desktop` (not from `header_menu`, nor the header's web button) |
| `store_mismatch_view` | "Choose your store" opens, after a click on the other platform's store | `clicked`, `recommended`: `play`, `appstore` |
| `store_mismatch_go` | "Choose your store" › go to the recommended store | `store` |
| `store_mismatch_stay` | "Choose your store" › continue to the clicked store | `store` |
| `store_mismatch_dismiss` | "Choose your store" closes with neither | `method`: `close_button`, `escape` |
| `menu_click` | A header menu opens | `menu_id`: `language_menu`, `theme_menu`, `get_menu` |
| `language_change` | Another language is picked | `language`: `en`, `pt`, `es`, `fr`, `de`, `it`, `pl`, `nl`, `tr`, `id`, `ja`; `origin`: `header_menu`, `footer` |
| `theme_change` | Another theme is picked | `theme`: `light`, `dark`, `system`; `origin`: `header_menu`, `footer` |
| `logo_click` | The logo | `origin`: `header`, `footer` |
| `navigation_click` | A link to a section of the page | `target`: the section's id (`features`, `how`, `platforms`, `faq`, a legal section), `top`; `origin`: `header`, `toc`, `to_top` |
| `select_content` | A link to a legal page | `content_type`: `legal`; `item_id`: `privacy_policy`, `terms_of_service`; `origin`: `header`, `footer`, `content` |
| `faq_open` | A FAQ question opens | `question`: `q1` to `q5` |
| `preview_tab_select` | Another tab of the landing's phone | `tab`: `bills`, `balances`, `stats` |
| `preview_sheet_open` | A sheet of the phone opens | `sheet`: `split`, `bill`, `payment`, `record`, `person`, `category` |
| `preview_change` | A change in the phone | `action`: `add_bill`, `delete_bill`, `record_payment`, `delete_payment` |
| `split_mode_select` | Another way to split in "Split it the way it really was" | `mode`: `equal`, `amounts`, `percent`, `shares`, `income`, `items` |
| `split_mode_edit` | The first change in a way to split, once per way and visit (a box, a field, a stepper, an item's face) | `mode`: `equal`, `amounts`, `percent`, `shares`, `income`, `items` |
| `receipt_split` | "Split these items" in "Scan the receipt", which opens the receipt in the split card | none |

A parameter shows in Google Analytics' reports only once it is registered as a custom dimension (Admin › Custom
definitions), event-scoped, with the same name. Add an event's row here in the same change that sends it.
