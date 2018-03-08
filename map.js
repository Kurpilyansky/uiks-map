var map = undefined;

function getRankColor(rank) {
  var colors = {3: 'rgb(255, 0, 0)',
                4: 'rgb(255, 51, 0)',
                5: 'rgb(255, 102, 0)',
                6: 'rgb(255, 153, 0)',
                7: 'rgb(0, 255, 0)',
                8: 'rgb(205, 255, 0)',
                9: 'rgb(225, 225, 36)',
                10: 'rgb(68, 170, 255)',
                11: 'rgb(101, 185, 255)',
                12: 'rgb(134, 200, 255)',
                13: 'rgb(167, 215, 255)',
                14: 'rgb(200, 230, 255)',
                15: 'rgb(233, 245, 255)'};
  if (rank <= 15) {
    return colors[rank];
  }
  /*var minRank = 10;
  var maxRank = 14;
  var L = [255, 204, 0];
  var L = [68, 170, 255];
  var R = [200, 230, 255];
  var res = [];
  for (var i = 0; i < 3; ++i) {
    res.push(Math.floor((L[i] * (maxRank - rank) + R[i] * (rank - minRank)) / (maxRank - minRank)));
  }
  return 'rgb(' + res[0] + ', ' + res[1] + ', ' + res[2] + ')';*/
}


document.addEventListener('DOMContentLoaded', function() {
  map = L.map('mapid').setView([59.9385, 30.3346], 11);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

  //const provider = new GeoSearch.GoogleProvider({params: 'TOKEN'}); // search is better than OpenStreetMap
  const provider = new GeoSearch.OpenStreetMapProvider();
  //const provider = new GeoSearch.EsriProvider();

  const searchControl = new GeoSearch.GeoSearchControl({
          provider: provider,
          style: 'bar'
        });

  map.addControl(searchControl);


  elements = [[], []];
  for (var i = 0; i < uiks.length; ++i) {
    var uik = uiks[i];
    if (uik.vote_coord_long == '-' || uik.rank == '-') {
      console.log(uik);
      continue; // TODO
    }

    var color = getRankColor(uik.rank);
    //console.log(color);
    var element = L.circle([uik.vote_coord_lat, uik.vote_coord_long], {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        width: 0,
        radius: 80 - 4 * uik.rank
      })
      .bindPopup('<a href="' + uik.url + '">' + uik.protocol + '</a> &ndash; приоритет <b>' + uik.rank + '</b><br/>' + uik.vote_address + '<br/>');


    //console.log(uik);
    var region = (uik.region_code == 78 ? 0 : 1);
    while (elements[region].length <= uik.rank) {
      elements[region].push(L.layerGroup());
    }
    elements[region][uik.rank].addLayer(element);
  }

  while (elements[0].length < elements[1].length) {
    elements[0].push(L.layerGroup());
  }
  while (elements[1].length < elements[0].length) {
    elements[1].push(L.layerGroup());
  }
  var ranks_count = elements[0].length;

  for (var region = 0; region < 2; ++region) {
    for (var rank = 0; rank < ranks_count; ++rank) {
      elements[region][rank].addTo(map);
    }
  }

  var rank_states = [];
  var region_states = [];
  var stats_container = document.getElementById('uiks_count');

  function updateLayersState() {
    var shown_count = 0;
    for (var region = 0; region < 2; ++region) {
      for (var rank = 0; rank < ranks_count; ++rank) {
        if (rank_states[rank] && region_states[region]) {
          map.addLayer(elements[region][rank]);
          shown_count += elements[region][rank].getLayers().length;
        } else {
          map.removeLayer(elements[region][rank]);
        }
      }
    }
    stats_container.textContent = shown_count;
  }

  var rank_filters = document.getElementById('rank_filters');
  for (let rank = 0; rank < ranks_count; ++rank) {
    if (elements[0][rank].getLayers().length == 0
        && elements[1][rank].getLayers().length == 0) {
      rank_states.push(false);
      continue;
    }
    let filter = document.createElement('div');
    filter.classList.add('rank_filter');
    rank_states.push(true);
    filter.appendChild(document.createTextNode(rank));
    rank_filters.appendChild(filter);
    if (rank_states[rank]) {
      filter.style.backgroundColor = getRankColor(rank);
    }

    filter.onclick = function() {
          filter.classList.toggle('inactive');
          rank_states[rank] = !rank_states[rank];
          if (rank_states[rank]) {
            filter.style.backgroundColor = getRankColor(rank);
          } else {
            filter.style.backgroundColor = '#aaa';
          }
          updateLayersState();
        };
  }

  var region_filters = document.getElementById('region_filters');
  for (let region = 0; region < 2; ++region) {
    let filter = document.createElement('div');
    filter.classList.add('region_filter');
    region_states.push(true);
    filter.appendChild(document.createTextNode(region ? 'ЛО' : 'СПб'));
    region_filters.appendChild(filter);

    filter.onclick = function() {
          filter.classList.toggle('inactive');
          region_states[region] = !region_states[region];
          updateLayersState();
        };
  }

  updateLayersState();
});
