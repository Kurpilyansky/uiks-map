var map = undefined;
var max_updated = 0;
var watcher_counts = {};
var uik_groups = {};

function getGroupKey(latitude, longitude) {
	return '' + latitude + '|' + longitude;
}

function getRankColor(rank){
	switch (rank){
		case 3:
			return 'rgb(255, 0, 0)';
		case    4:
			return 'rgb(255, 51, 0)';
		case 5:
			return 'rgb(255, 102, 0)';
		case 6:
			return 'rgb(255, 153, 0)';
		case 7:
			return 'rgb(0, 255, 0)';
		case 8:
			return 'rgb(205, 255, 0)';
		case 9:
			return 'rgb(225, 225, 36)';
		case 10:
			return 'rgb(68, 170, 255)';
		case 11:
			return 'rgb(101, 185, 255)';
		case 12:
			return 'rgb(134, 200, 255)';
		case 13:
			return 'rgb(167, 215, 255)';
		case 14:
			return 'rgb(200, 230, 255)';
		case 15:
			return 'rgb(233, 245, 255)';
		default:
			return 'rgb(233, 245, 255)';
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


document.addEventListener('DOMContentLoaded', function (){
	let uik_token = prompt('Введите код доступа');

	if (uik_token != ''){
		$.ajax({
			url: "index.php",
			method: 'post',
			dataType: 'json',
			data: {
				action: 'getUiks',
				token: uik_token
			},
			success: function (response){
				init_map(response);
				setInterval(getUpdatedCounts, 15000);
			},
			error(a, b, c){
				console.log(a, b, c);
				alert(b);
			}
		})
	}else{
		init_map([]);
	}

	function getUpdatedCounts() {
		$.ajax({
			url: "index.php",
			method: 'post',
			dataType: 'json',
			data: {
				action: 'getUpdated',
				token: uik_token,
				updated: max_updated
			},
			success: function (response){
				max_updated = Math.max(response.updated, max_updated);
				for (let i=0; i<response.rows.length; i++) {
					watcher_counts[response.rows[i].id] = response.rows[i].watchers_count;
				}
			},
			error(a, b, c){
				console.log(a, b, c);
				alert(b);
			}
		})
	}

	$(document).on('click', '.js-update-watcher', function (){
		if ($(this).is('.disabled')) {
			return;
		}
		$(this).addClass('disabled');

		$.ajax({
			url: "index.php",
			method: 'post',
			dataType: 'json',
			context: this,
			data: {
				action: $(this).data('action'),
				token: uik_token,
				uik_id: $(this).data('uik_id')
			},
			success: function (response){
				$('#w_count_uik_' + $(this).data('uik_id')).text(response.watchers_count);
				watcher_counts[$(this).data('uik_id')] = response.watchers_count;
			},
			error: function(a, b, c){
				console.log(a, b, c);
				alert(b);
			},
			complete: function(){
				$(this).removeClass('disabled');
			}
		})
	});

	function init_map(uiks){
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

		function renderGroup(rank, group_key) {
			let color = getRankColor(rank);
			let element = L.circle([last_latitude, last_longitude], {
				color: color,
				fillColor: color,
				fillOpacity: 0.4,
				width: 0,
				radius: 80 - 4 * rank,
				groupkey: group_key
			}).bindPopup(function(element){
				let group = uik_groups[element.options.groupkey];
				let popup_text = '';
				for (let i=0; i<group.length; i++) {
					var uik = group[i];
					popup_text += '<a href="' + uik.url + '" target="_blank">' + uik.protocol + '</a> &ndash; приоритет <b>' + uik.rank
						+ ' <br>Наблюдатели: <b id="w_count_uik_' + uik.id + '">' + watcher_counts[uik.id] + '</b> '
						+ '<a href="javascript:" class="js-update-watcher watcher-btn" data-action="incWatcher" data-uik_id="' + uik.id + '">+</a> '
						+ '<a href="javascript:" class="js-update-watcher watcher-btn" data-action="decWatcher" data-uik_id="' + uik.id + '">-</a>'
						+ '<hr>';
				}

				return popup_text + uik.vote_address
			});

			return element;
		}

		// we collect all uiks with the same coordinates in the same popup
		let popup_text = '';
		let last_latitude = -1;
		let last_longitude = -1;
		let max_rank = 0;
		let group_is_rendered = false;
		for (var i = 0; i < uiks.length; ++i){
			var uik = uiks[i];
			if (uik.vote_coord_long == '-' || uik.rank == '-'){
				console.log(uik);
				continue; // TODO
			}

			if (!uik_groups[getGroupKey(uik.vote_coord_lat, uik.vote_coord_long)]) {
				uik_groups[getGroupKey(uik.vote_coord_lat, uik.vote_coord_long)] = [];
			}

			max_updated = Math.max(uik.updated, max_updated);

			max_rank = Math.min(max_rank, uik.rank);

			if (last_latitude !== uik.vote_coord_lat || last_longitude !== uik.vote_coord_long && last_longitude>0){
				var element = renderGroup(max_rank, getGroupKey(last_latitude, last_longitude));
				var region = (uik.region_code == 78 ? 0 : 1);

				while (elements[region].length <= max_rank){
					elements[region].push(L.layerGroup());
				}
				elements[region][max_rank].addLayer(element);

				max_rank = 15;
				group_is_rendered = true;
			} else {
				group_is_rendered = false;
			}

			uik_groups[getGroupKey(uik.vote_coord_lat, uik.vote_coord_long)].push(uik);
			watcher_counts[uik.id] = uik.watchers_count;

			last_latitude = uik.vote_coord_lat;
			last_longitude = uik.vote_coord_long;

		}

		// render last group if it was not rendered in the loop
		if (!group_is_rendered){
			var element = renderGroup(max_rank, getGroupKey(last_latitude, last_longitude));

			while (elements[region].length <= max_rank){
				elements[region].push(L.layerGroup());
			}
			elements[region][max_rank].addLayer(element);
		}


		while (elements[0].length < elements[1].length){
			elements[0].push(L.layerGroup());
		}
		while (elements[1].length < elements[0].length){
			elements[1].push(L.layerGroup());
		}
		var ranks_count = elements[0].length;

		for (var region = 0; region < 2; ++region){
			for (var rank = 0; rank < ranks_count; ++rank){
				elements[region][rank].addTo(map);
			}
		}

		var rank_states = [];
		var region_states = [];
		var stats_container = document.getElementById('uiks_count');

		function updateLayersState(){
			var shown_count = 0;
			for (var region = 0; region < 2; ++region){
				for (var rank = 0; rank < ranks_count; ++rank){
					if (rank_states[rank] && region_states[region]){
						map.addLayer(elements[region][rank]);
						shown_count += elements[region][rank].getLayers().length;
					}else{
						map.removeLayer(elements[region][rank]);
					}
				}
			}
			stats_container.textContent = shown_count;
		}

		var rank_filters = document.getElementById('rank_filters');
		for (let rank = 0; rank < ranks_count; ++rank){
			if (elements[0][rank].getLayers().length == 0
				&& elements[1][rank].getLayers().length == 0){
				rank_states.push(false);
				continue;
			}
			let filter = document.createElement('div');
			filter.classList.add('rank_filter');
			rank_states.push(true);
			filter.appendChild(document.createTextNode(rank));
			rank_filters.appendChild(filter);
			if (rank_states[rank]){
				filter.style.backgroundColor = getRankColor(rank);
			}

			filter.onclick = function (){
				filter.classList.toggle('inactive');
				rank_states[rank] = !rank_states[rank];
				if (rank_states[rank]){
					filter.style.backgroundColor = getRankColor(rank);
				}else{
					filter.style.backgroundColor = '#aaa';
				}
				updateLayersState();
			};
		}

		var region_filters = document.getElementById('region_filters');
		for (let region = 0; region < 2; ++region){
			let filter = document.createElement('div');
			filter.classList.add('region_filter');
			region_states.push(true);
			filter.appendChild(document.createTextNode(region ? 'ЛО' : 'СПб'));
			region_filters.appendChild(filter);

			filter.onclick = function (){
				filter.classList.toggle('inactive');
				region_states[region] = !region_states[region];
				updateLayersState();
			};
		}

		updateLayersState();
	}
});


