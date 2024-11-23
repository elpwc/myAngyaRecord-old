'use strict';
let geojsonData;

var map = L.map('map').setView([31.85889704445453, 132.31933593750003], 5);

const prefDefaultStyle = { fillColor: '#ffffff00', opacity: 1, fillOpacity: 1, weight: 1, color: 'black' };

const mapStyles = [
	{ name: 'classic', bgcolor: ['#d646d6', '#ff3d3d', '#ffa136', '#50ff50', '#bef7ff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
	{ name: 'light', bgcolor: ['#ffabff', '#ff8686', '#ffdf72', '#a5ffa5', '#ceeaff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
	{ name: 'dark', bgcolor: ['#d646d6', '#ff3d3d', '#faa429', '#43dd43', '#72c4ff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
];

let currentMapStyle = 2;

let showShinkoukyoku = true;
let showPlaceNames = true;
let showRailways = true;

/**
 * 从localstorage读取指定市町村编号的值
 * @param {*} jichitai_index
 * @returns
 */
const getAngya = (jichitai_index) => {
	const value = localStorage.getItem(jichitai_index);
	if (value === null) {
		return 5;
	} else {
		return Number(value);
	}
};

/**
 * 保存指定市町村编号的值
 * @param {*} jichitai_index
 * @returns
 */
const updateAngya = (jichitai_index, angya, prefname) => {
	localStorage.setItem(jichitai_index, angya);

	refreshSinglePref(prefname);
};

/**
 * 加载pref
 * @param {*} GeoJsonFileName
 */
const loadPrefGeoJson = (GeoJsonFileName, name) => {
	fetch(GeoJsonFileName)
		.then((response) => response.json())
		.then((data) => {
			geojsonData = data;
			// geojsonData
			L.geoJSON(geojsonData, {
				attribution: name,
				style: function (feature) {
					return prefDefaultStyle;
				},
				onEachFeature: function (feature, layer) {
					if (showPlaceNames) {
						// placename
						const clickedObject = feature;
						const pref_name = clickedObject.properties.name;
						const label = L.marker(layer.getBounds().getCenter(), {
							icon: L.divIcon({
								className: 'shichousonlabel',
								html: pref_name,
								iconSize: [100, 20],
							}),
							interactive: false,
						});

						label.addTo(map);

						if (map.getZoom() >= 8) {
							label.getElement().style.display = 'none';
						}

						if (!showPlaceNames) {
							label.getElement().style.display = 'none';
						}

						map.on('zoomend', function () {
							if (showPlaceNames) {
								if (map.getZoom() < 8) {
									if (!showPlaceNames) {
										label.getElement().style.display = 'none';
									} else {
										if (label.getElement()) {
											label.getElement().style.display = 'block';
										}
									}
								} else {
									if (label.getElement()) {
										label.getElement().style.display = 'none';
									}
								}
							}
						});
					}
				},
				interactive: false,
			}).addTo(map);
		})
		.catch((error) => console.error('Error loading GeoJSON:', error));
};

/**
 * 加载市町村区
 * @param {*} GeoJsonFileName
 */
const loadShichosonGeoJson = (GeoJsonFileName, prefName) => {
	fetch(GeoJsonFileName)
		.then((response) => response.json())
		.then((data) => {
			geojsonData = data;
			// geojsonData
			L.geoJSON(geojsonData, {
				attribution: prefName,
				style: function (feature) {
					return { fillColor: 'white', color: 'black', opacity: 1, fillOpacity: 1, weight: 0.35 };
				},
				onEachFeature: function (feature, layer) {
					const clickedObject = feature;
					const pref_name = clickedObject.properties.N03_001;
					const sinkokyoku_name = clickedObject.properties.N03_002;
					const gun_seireishi_shicho_name = clickedObject.properties.N03_003;
					const shichosonku_name = clickedObject.properties.N03_004;
					const jichitai_index = clickedObject.properties.N03_007;

					const angya = getAngya(jichitai_index);
					const shichosonDefaultStyle = { fillColor: mapStyles[currentMapStyle].bgcolor[angya], color: 'black', opacity: 1, fillOpacity: 1, weight: 0.35 };
					const hoverStyle = { fillColor: mapStyles[currentMapStyle].bgcolor[angya], color: 'blue', opacity: 1, fillOpacity: 1, weight: 1.5 };

					layer.setStyle(shichosonDefaultStyle);

					layer.on('mouseover', function () {
						layer.setStyle(hoverStyle);
					});

					layer.on('mouseout', function () {
						layer.setStyle(shichosonDefaultStyle);
					});

					// placename
					// 政令市
					let title = shichosonku_name;
					if (gun_seireishi_shicho_name !== null) {
						if (gun_seireishi_shicho_name.length > 1) {
							if (gun_seireishi_shicho_name.substr(-1) === '市') {
								title = gun_seireishi_shicho_name + '<br/>' + shichosonku_name;
							}
						}
					}
					const label = L.marker(layer.getBounds().getCenter(), {
						icon: L.divIcon({
							className: 'shichousonlabel',
							html: `<span class='chichosonLabel' style="color: ${mapStyles[currentMapStyle].color[angya]}">${title}</span>`,
							iconSize: [100, 20],
						}),
						interactive: false,
					});

					label.addTo(map);

					if (map.getZoom() < 8) {
						label.getElement().style.display = 'none';
					}

					if (!showPlaceNames) {
						label.getElement().style.display = 'none';
					}

					map.on('zoomend', function () {
						if (showPlaceNames) {
							if (map.getZoom() >= 8) {
								if (!showPlaceNames) {
									label.getElement().style.display = 'none';
								} else {
									if (label.getElement()) {
										label.getElement().style.display = 'block';
									}
								}
							} else {
								if (label.getElement()) {
									label.getElement().style.display = 'none';
								}
							}
						}
					});
				},
			})
				.on('click', (e) => {
					// 都道府県をクリック
				})
				.bindPopup(
					function (layer) {
						console.log(layer);
						const clickedObject = layer.feature;
						const pref_name = clickedObject.properties.N03_001;
						const sinkokyoku_name = clickedObject.properties.N03_002;
						const gun_seireishi_shicho_name = clickedObject.properties.N03_003;
						const shichosonku_name = clickedObject.properties.N03_004;
						const jichitai_index = clickedObject.properties.N03_007.toString();
						console.log(clickedObject);

						let title = shichosonku_name;
						let route = pref_name + (sinkokyoku_name ?? '');
						if (gun_seireishi_shicho_name !== null) {
							if (gun_seireishi_shicho_name.length > 0) {
								if (gun_seireishi_shicho_name.substr(-1) === '市') {
									title = gun_seireishi_shicho_name + shichosonku_name;
								} else {
									route += gun_seireishi_shicho_name;
								}
							}
						}

						return `<div class='popup'>
						<p class='popuproute' style='margin: 0;'>${route}</p>
						<p class='popuptitle' style='margin: 0;'>${title}</p>

						<div class='popupbuttoncontainer'>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 0, '${pref_name}')" style="background-color: ${mapStyles[currentMapStyle].bgcolor[0]}; color: ${mapStyles[currentMapStyle].color[0]};">居住</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 1, '${pref_name}')" style="background-color: ${mapStyles[currentMapStyle].bgcolor[1]}; color: ${mapStyles[currentMapStyle].color[1]};">宿泊 </button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 2, '${pref_name}')" style="background-color: ${mapStyles[currentMapStyle].bgcolor[2]}; color: ${mapStyles[currentMapStyle].color[2]};">訪問</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 3, '${pref_name}')" style="background-color: ${mapStyles[currentMapStyle].bgcolor[3]}; color: ${mapStyles[currentMapStyle].color[3]};">接地</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 4, '${pref_name}')" style="background-color: ${mapStyles[currentMapStyle].bgcolor[4]}; color: ${mapStyles[currentMapStyle].color[4]};">通過</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 5, '${pref_name}')" style="background-color: ${mapStyles[currentMapStyle].bgcolor[5]}; color: ${mapStyles[currentMapStyle].color[5]};">未踏</button>
						</div>
					</div>`;
					},
					{
						minWidth: 'fit-content',
					}
				)
				.addTo(map);
		})
		.catch((error) => console.error('Error loading GeoJSON:', error));
};

/**
 * railway
 */
const loadRailways = () => {
	fetch('./geojson/japan/railways.geojson')
		.then((response) => response.json())
		.then((data) => {
			geojsonData = data;
			console.log(geojsonData);
			L.geoJSON(geojsonData, {
				attribution: 'railways',
				style: function (feature) {
					if (feature.properties.name.includes('旅客')) {
						return { weight: 1.5, color: 'darkred', opacity: 1, fillOpacity: 1 };
					} else {
						return { weight: 1, color: 'blue', opacity: 1, fillOpacity: 1 };
					}
				},
			}).addTo(map);
		})
		.catch((error) => console.error('Error loading GeoJSON:', error));
};

const refresh = () => {
	map.eachLayer(function (layer) {
		map.removeLayer(layer);
	});

	todofukenFiles.forEach((todofukenFile) => {
		loadShichosonGeoJson('./geojson/japan/todofuken/' + todofukenFile[1], todofukenFile[0]);
	});

	if (showRailways) {
		loadRailways();
	}

	loadPrefGeoJson('./geojson/japan/prefectures.geojson', 'pref');

	if (showShinkoukyoku) {
		loadPrefGeoJson('./geojson/japan/hokkaido-branch.geojson', 'hokkaido_shinkoukyoku');
	}
};

const delLayer = (name) => {
	if (typeof name === 'string') {
		map.eachLayer(function (layer) {
			if (layer.getAttribution() === name) {
				map.removeLayer(layer);
			}
		});
	} else {
		map.eachLayer(function (layer) {
			if (name.includes(layer.getAttribution())) {
				map.removeLayer(layer);
			}
		});
	}
};

/**
 * 刷新一个pref的json
 * @param {*} refreshTarget
 */
const refreshSinglePref = (refreshTarget = '') => {
	delLayer([refreshTarget, 'pref']);
	const refreshTargetIndex = todofukenFiles.findIndex((pref) => {
		console.log(pref);
		return pref[0] === refreshTarget;
	});
	console.log(refreshTargetIndex);
	if (refreshTargetIndex !== -1) {
		loadShichosonGeoJson('./geojson/japan/todofuken/' + todofukenFiles[refreshTargetIndex][1], todofukenFiles[refreshTargetIndex][0]);
	}

	if (showRailways) {
		delLayer('railways');
		loadRailways();
	}

	loadPrefGeoJson('./geojson/japan/prefectures.geojson', 'pref');

	if (showShinkoukyoku) {
		delLayer('hokkaido_shinkoukyoku');
		loadPrefGeoJson('./geojson/japan/hokkaido-branch.geojson', 'hokkaido_shinkoukyoku');
	}
};

const layerControlCheckBox_onChange = () => {
	$(function () {
		const shichousonChecked = $('#shichousonkuCheckbox').prop('checked');
		showShinkoukyoku = $('#sinkoukyokuCheckbox').prop('checked');
		showPlaceNames = $('#placenameCheckbox').prop('checked');
		showRailways = $('#railwaysCheckbox').prop('checked');

		refresh();
	});
};

const init = () => {
	layerControlCheckBox_onChange();
};

// init
init();
