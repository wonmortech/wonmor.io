[out:json][timeout:150];
area["ISO3166-1"="UZ"][admin_level=2]->.c;
nwr["amenity"="place_of_worship"]["religion"="muslim"](area.c);
out tags center;
