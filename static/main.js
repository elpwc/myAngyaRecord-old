let geojsonData;

let showPlaceName = true;

var map = L.map('map').setView([31.85889704445453, 132.31933593750003], 5);

// 定义默认样式和悬停样式
const prefDefaultStyle = { fillColor: '#ffffff00', opacity: 1, fillOpacity: 1, weight: 1.5, color: 'darkred' };

const mapStyles = [
	{ name: 'classic', bgcolor: ['#d646d6', '#ff3d3d', '#ffa136', '#50ff50', '#bef7ff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
	{ name: 'red', bgcolor: ['#d646d6', '#ff3d3d', '#ffa136', '#50ff50', '#bef7ff', 'white'], color: ['black', 'black', 'black', 'black', 'black', 'black'] },
];

let currentMapStyle = 0;

/**
 * 从localstorage读取指定市町村编号的值
 * @param {*} jichitai_index
 * @returns
 */
const getAngya = (jichitai_index) => {
	console.log(jichitai_index);
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
const updateAngya = (jichitai_index, angya) => {
	localStorage.setItem(jichitai_index, angya);
	init();
};

/**
 * 加载pref
 * @param {*} GeoJsonFileName
 */
const loadPrefGeoJson = (GeoJsonFileName) => {
	fetch(GeoJsonFileName)
		.then((response) => response.json())
		.then((data) => {
			geojsonData = data;
			console.log(geojsonData);
			// 继续处理 geojsonData
			L.geoJSON(geojsonData, {
				style: function (feature) {
					return prefDefaultStyle;
				},
				onEachFeature: function (feature, layer) {
					if (showPlaceName) {
						// 创建地名标签
						const clickedObject = feature;
						const pref_name = clickedObject.properties.name;
						const label = L.marker(layer.getBounds().getCenter(), {
							icon: L.divIcon({
								className: 'shichousonlabel', // 添加自定义样式类
								html: pref_name,
								iconSize: [100, 20], // 标签大小
							}),
							interactive: false, // 禁止交互，以避免影响鼠标事件
						});

						// 将标签添加到图层并控制其显示
						label.addTo(map);

						// 初始时隐藏标签
						if (map.getZoom() >= 8) {
							// 设置你想要的显示级别
							label.getElement().style.display = 'none';
						}

						if (!showPlaceName) {
							label.getElement().style.display = 'none';
						}

						// 当地图缩放时控制标签的显示和隐藏
						map.on('zoomend', function () {
							if (showPlaceName) {
								if (map.getZoom() < 8) {
									if (!showPlaceName) {
										label.getElement().style.display = 'none';
									} else {
										label.getElement().style.display = 'block';
									}
								} else {
									label.getElement().style.display = 'none';
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
const loadShichosonGeoJson = (GeoJsonFileName) => {
	fetch(GeoJsonFileName)
		.then((response) => response.json())
		.then((data) => {
			geojsonData = data;
			// 继续处理 geojsonData
			L.geoJSON(geojsonData, {
				style: function (feature) {
					return { fillColor: 'white', color: 'blue', opacity: 1, fillOpacity: 1, weight: 0.5 };
				},
				onEachFeature: function (feature, layer) {
					const clickedObject = feature;
					const pref_name = clickedObject.properties.N03_001;
					const sinkokyoku_name = clickedObject.properties.N03_002;
					const gun_seireishi_shicho_name = clickedObject.properties.N03_003;
					const shichosonku_name = clickedObject.properties.N03_004;
					const jichitai_index = clickedObject.properties.N03_007;

					// 着色
					const angya = getAngya(jichitai_index);
					console.log(angya, mapStyles[currentMapStyle].bgcolor[angya]);
					const shichosonDefaultStyle = { fillColor: mapStyles[currentMapStyle].bgcolor[angya], color: 'blue', opacity: 1, fillOpacity: 1, weight: 0.5 };
					const hoverStyle = { fillColor: mapStyles[currentMapStyle].bgcolor[angya], color: 'blue', opacity: 1, fillOpacity: 1, weight: 1.5 };

					layer.setStyle(shichosonDefaultStyle);

					// 鼠标悬停时应用 hover 样式
					layer.on('mouseover', function () {
						layer.setStyle(hoverStyle);
					});

					// 鼠标移出时恢复默认样式
					layer.on('mouseout', function () {
						layer.setStyle(shichosonDefaultStyle);
					});

					// 创建地名标签
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
							className: 'shichousonlabel', // 添加自定义样式类
							html: `<span style="color: ${mapStyles[currentMapStyle].color[angya]}">${title}</span>`,
							iconSize: [100, 20], // 标签大小
						}),
						interactive: false, // 禁止交互，以避免影响鼠标事件
					});

					// 将标签添加到图层并控制其显示
					label.addTo(map);

					// 初始时隐藏标签
					if (map.getZoom() < 8) {
						// 设置你想要的显示级别
						label.getElement().style.display = 'none';
					}

					if (!showPlaceName) {
						label.getElement().style.display = 'none';
					}

					// 当地图缩放时控制标签的显示和隐藏
					map.on('zoomend', function () {
						if (showPlaceName) {
							if (map.getZoom() >= 8) {
								if (!showPlaceName) {
									label.getElement().style.display = 'none';
								} else {
									label.getElement().style.display = 'block';
								}
							} else {
								label.getElement().style.display = 'none';
							}
						}
					});
				},
			})
				.on('click', (e) => {
					// 都道府県をクリック
				})
				.bindPopup(function (layer) {
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
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 0)" style="background-color: ${mapStyles[currentMapStyle].bgcolor[0]}; color: ${mapStyles[currentMapStyle].color[0]};">居住 (1ヶ月以上住んだ)</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 1)" style="background-color: ${mapStyles[currentMapStyle].bgcolor[1]}; color: ${mapStyles[currentMapStyle].color[1]};">宿泊 (泊まった)</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 2)" style="background-color: ${mapStyles[currentMapStyle].bgcolor[2]}; color: ${mapStyles[currentMapStyle].color[2]};">訪問 (歩いた)</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 3)" style="background-color: ${mapStyles[currentMapStyle].bgcolor[3]}; color: ${mapStyles[currentMapStyle].color[3]};">接地 (降り立った)</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 4)" style="background-color: ${mapStyles[currentMapStyle].bgcolor[4]}; color: ${mapStyles[currentMapStyle].color[4]};">通過 (通過した)</button>
							<button class="popupbutton" onclick="updateAngya('${jichitai_index}', 5)" style="background-color: ${mapStyles[currentMapStyle].bgcolor[5]}; color: ${mapStyles[currentMapStyle].color[5]};">未踏 (行ってない)</button>
						</div>
					</div>`;
				})
				.addTo(map);
		})
		.catch((error) => console.error('Error loading GeoJSON:', error));
};

/**
 * 加载铁道
 */
const loadRailways = () => {
	fetch('./geojson/japan/railways.geojson')
		.then((response) => response.json())
		.then((data) => {
			geojsonData = data;
			console.log(geojsonData);
			L.geoJSON(geojsonData, {
				style: function (feature) {
					if (feature.properties.name.includes('旅客')) {
						return { weight: 1.5, color: 'darkgray', opacity: 1, fillOpacity: 1 };
					} else {
						return { weight: 1, color: 'lightgray', opacity: 1, fillOpacity: 1 };
					}
				},
			}).addTo(map);
		})
		.catch((error) => console.error('Error loading GeoJSON:', error));
};

const refresh = (showShinkoukyoku = true, ShowPlaceNames = true, ShowRailWays = true) => {
	showPlaceName = ShowPlaceNames;
	console.log(showPlaceName, ShowPlaceNames);
	map.eachLayer(function (layer) {
		map.removeLayer(layer);
	});

	todofukenFiles.forEach((todofukenFile) => {
		loadShichosonGeoJson('./geojson/japan/todofuken/' + todofukenFile[1]);
	});

	if (ShowRailWays) {
		loadRailways();
	}
	loadPrefGeoJson('./geojson/japan/prefectures.geojson');

	if (showShinkoukyoku) {
		loadPrefGeoJson('./geojson/japan/hokkaido-branch.geojson');
	}
};

const layerControlCheckBox_onChange = () => {
	$(function () {
		const shichousonChecked = $('#shichousonkuCheckbox').prop('checked');
		const sinkoukyokuChecked = $('#sinkoukyokuCheckbox').prop('checked');
		const placenameChecked = $('#placenameCheckbox').prop('checked');
		const railwayChecked = $('#railwaysCheckbox').prop('checked');

		refresh(sinkoukyokuChecked, placenameChecked, railwayChecked);
	});
};

const init = () => {
	layerControlCheckBox_onChange();
};

// init
init();
