---
title: "Mosques from OpenStreetMap: 2,285 congregations, one layer"
description: "How dtwin imports every mosque in Uzbekistan from OpenStreetMap and keeps congregation times in a layer of their own, separate from the prayer-time calculation."
date: 2026-10-27
kind: engineering
area: faith-society
featured: true
source:
  - "https://wiki.openstreetmap.org/wiki/Overpass_API"
  - "https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dplace_of_worship"
  - "https://www.openstreetmap.org/copyright"
  - "dtwinuz/dtwin #43"
reproduce:
  note: "Count the mosques OpenStreetMap knows in Uzbekistan today with the same filter dtwin uses; the number will drift from ours as mappers edit."
  commands:
    - 'curl -s https://overpass-api.de/api/interpreter --data-urlencode ''data=[out:json][timeout:150];area["ISO3166-1"="UZ"][admin_level=2]->.c;nwr["amenity"="place_of_worship"]["religion"="muslim"](area.c);out count;'''
---

dtwin has computed prayer times for a long time. What it did not know was when people actually pray together. A mosque board does not show the adhan; it shows the congregation time, a moment the imam picks somewhere inside the prayer window. In Hanafi practice fajr is prayed at first light and isha later in the evening, so the gap between the adhan and the congregation can be large. Our reminders and free-time calculations were anchored to the adhan, and for anyone who prays in a mosque they were simply wrong.

On October 27, 2026 we shipped a fix with two parts: a catalogue of every mosque in Uzbekistan, imported from OpenStreetMap, and congregation times kept as a separate layer on top of the existing prayer-time engine. At the first production import the catalogue held 2,285 mosques, 227 of them in Tashkent.

Map data in this post and in the product: © OpenStreetMap contributors, available under the Open Database License.

```steps
Query :: One Overpass query asks for every place of worship tagged religion=muslim inside Uzbekistan's national boundary.
Parse :: Nodes keep their own coordinates; ways and relations are reduced to their centre point.
Upsert :: Each mosque is keyed by its OSM reference, so a weekly re-import updates rows instead of duplicating them.
Layer :: Congregation rules live apart from the adhan windows and are checked against them every day.
Use :: Reminders, the Today view and free-time calculation read the congregation time when one exists.
```

## One query for a whole country

OpenStreetMap tags a mosque as `amenity=place_of_worship` with `religion=muslim`. The Overpass API can return every such object inside an administrative area in a single request, so the importer is one query:

```text
[out:json][timeout:150];
area["ISO3166-1"="UZ"][admin_level=2]->.c;
nwr["amenity"="place_of_worship"]["religion"="muslim"](area.c);
out tags center;
```

`nwr` asks for nodes, ways and relations together. That matters: a small neighbourhood mosque is often mapped as a single point, while a large one is drawn as a building outline (a way) or a multipolygon (a relation). `out tags center` returns the tags plus a centre point for anything that is not a point, which is all we need to put a pin on a map and measure distance.

Parsing follows a few fixed rules:

- **A stable key.** Each mosque gets a reference like `n123456` or `w789012`: the first letter of the OSM type plus its ID. Duplicates by reference are dropped.
- **A name in the user's script first.** The importer tries `name:uz`, then `name`, `name:uz-Latn`, `name:ru` and `name:en`, and takes the first one that is filled in.
- **An address only when one is mapped.** It uses `addr:full` if present, otherwise street, house number and city joined together, and leaves the field empty when OpenStreetMap has nothing.
- **Six decimal places.** Coordinates are rounded to six digits, roughly ten centimetres, which is more precision than a mosque pin needs.

The write is an upsert keyed on the OSM reference. A background worker checks every six hours and re-imports once the newest row is seven days old; the first check runs two minutes after start-up. An empty response is treated as an error rather than as "the country has no mosques", so a failed request can never wipe the catalogue.

## A separate layer for congregation times

The tempting design is to replace the computed prayer time with the mosque's time. We did not do that. The adhan windows stay the single source of truth for everything that depends on them: where the dtwin day ends (at maghrib), fasting, missed-prayer (qada) tracking and prayer logging. Congregation times sit on top, in their own module.

A congregation rule for each prayer has one of three modes:

| Mode | Meaning |
|---|---|
| Fixed | a clock time, for example 05:40 |
| After adhan | a number of minutes after the computed adhan, up to 120 |
| Off | no congregation for this prayer |

Rules come from two places: the mosque's shared timetable and the user's own settings. The user's own rule wins. On Fridays a separate Jumu'ah rule replaces dhuhr.

Every day each rule is resolved against that day's real window: fajr must fall before sunrise, dhuhr before asr, isha before the next fajr, and so on. A time that falls outside its window is not shown and is reported as `outOfWindow`. That is how a stale timetable shows itself. A fixed 18:30 maghrib is fine in winter and impossible in June; rather than show a congregation before the adhan, we drop it for that day and say why.

Profiles are held in memory and loaded when the worker starts, so reminders and the Today view do not hit the database for every check. Free-time calculation blocks the congregation time plus the user's travel time to the mosque.

## What users add

OpenStreetMap is good in Uzbekistan's cities and thinner elsewhere, so users can add a mosque that is missing. Two limits keep the catalogue clean: a new mosque within 25 metres of an existing one is rejected as a likely duplicate, and one user can add at most 10 a day.

Timetables are shared. Any user who prays at a mosque can enter its times, and others confirm them. Editing a timetable resets its confirmations, so a confirmation always refers to the times currently shown. No tool exposed to AI assistants can write a shared timetable: the assistant can look up mosques and set the user's own times, but not change what everyone else sees.

The same catalogue appears in three places: the `/masjid` command in the Telegram bot (send a location and get the nearest mosques with buttons to choose one), a map tab on the web built with Leaflet and OpenStreetMap tiles, and assistant tools for finding and choosing a mosque.

## The number is a snapshot

The 2,285 in the title is what the production import stored on October 27, 2026. We ran the same query again on November 13, 2026, against an OpenStreetMap database timestamped 05:56 UTC that morning. It returned 2,289 objects: 1,511 nodes, 740 ways and 38 relations. Of those, 2,137 carry a `name` or `name:uz` tag and 1,355 carry at least one `addr:*` tag.

Four new mosques in seventeen days is just mappers at work, and it is the point of re-importing weekly instead of freezing a list. It also means the catalogue is only as good as the map. The best way to improve dtwin's mosque data is to improve OpenStreetMap, which helps everyone else as well.

## A calculation change that came with it

While validating the times we changed the default calculation method for new users from the North American convention (a 15° twilight angle) to the islom.uz method (15.5°). In Tashkent, compared with the islom.uz timetable, the old default put maghrib two to three minutes early and fajr two to three minutes late, which is the wrong direction to be off for iftar and suhoor. A migration moved existing users in the Tashkent and Samarkand time zones who were still on the old default.

## Limitations

- **Coverage follows the map.** Some mosques are missing or unnamed in OpenStreetMap; 152 of today's objects carry neither `name` nor `name:uz`.
- **Congregation times are crowd-sourced.** They are only as fresh as the last person who updated them. The window check catches impossible times, not merely outdated ones.
- **TLS on old systems.** The public Overpass endpoint we use accepts only TLS 1.3. Windows 10's built-in TLS stack could not connect during development, while Linux containers in production could, so the endpoint is configurable and local tests point it at a stub.
- **The migration is one-way.** Rolling it back does not restore the old calculation method for the users it moved.
