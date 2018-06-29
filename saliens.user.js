// ==UserScript==
// @name         Saliens Data Table
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://steamcommunity.com/saliengame
// @match        https://steamcommunity.com/saliengame/
// @match        https://steamcommunity.com/saliengame/play
// @match        https://steamcommunity.com/saliengame/play/
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @require      https://cdn.datatables.net/1.10.18/js/jquery.dataTables.min.js
// @require      https://cdn.datatables.net/1.10.18/js/dataTables.bootstrap.min.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	$J('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdn.datatables.net/1.10.18/css/dataTables.bootstrap.min.css">');

	var time = 300;
	var timer = null;
	var planetsZones = [];
	var planetsState = [];

	var scoreTable = [
		0,			// Level 1
		1200,		// Level 2
		2400,		// Level 3
		4800,		// Level 4
		12000,		// Level 5
		30000,		// Level 6
		72000,		// Level 7
		180000,		// Level 8
		450000,		// Level 9
		1200000,	// Level 10
		2400000,	// Level 11
		3600000,	// Level 12
		4800000,	// Level 13
		6000000,	// Level 14
		7200000,	// Level 15
		8400000,	// Level 16
		9600000,	// Level 17
		10800000,	// Level 18
		12000000,	// Level 19
		14400000,	// Level 20
		16800000,	// Level 21
		19200000,	// Level 22
		21600000,	// Level 23
		24000000,	// Level 24
		26400000,	// Level 25
	];

	var mainContent =
		'<div style="position: absolute; top: 0; right: 0; z-index: 999;">' +
			'<button type="button" id="dataTableButton" class="btn btn-default btn-lg">' +
				'<span class="glyphicon glyphicon-th-list" aria-hidden="true"></span>' +
			'</button>' +
		'</div>' +
		'<div id="dataTableContainer" class="container-fluid" style="padding-top: 15px;">' +
			'<div class="row" style="font-size: 16px;">' +
				'<div class="col-md-1">' +
					'<div id="timer">00:00</div>' +
				'</div>' +
				'<div class="col-md-3">' +
					'Latest Update: <span id="latestUpdate">-</span>' +
				'</div>' +
				'<div class="col-md-2">' +
					'Game Version: <span id="gameVersion">-</span>' +
				'</div>' +
			'</div>' +
		'<div class="row">' +
			'<div class="col-md-12">' +
				'<div id="playerInfo" style="font-size: 16px;">Planet: - | Zone: - | Level: - | Exp: - | Time on planet: -</div>' +
			'</div>' +
		'</div>' +
		'<div class="row">' +
			'<div class="col-md-12">' +
				'<table id="planetsDataTable" class="table table-striped table-bordered nowrap" style="width: 100%;">' +
					'<thead>' +
						'<tr>' +
							'<td>&nbsp;</td>' +
							'<td>ID</td>' +
							'<td>Name</td>' +
							'<td>Current Players</td>' +
							'<td>Zones</td>' +
							'<td>Low Zones</td>' +
							'<td>Medium Zones</td>' +
							'<td>High Zones</td>' +
							'<td>Capture Progress</td>' +
							'<td>Activation Time</td>' +
							'<td>Capture Time</td>' +
							'<td>Active</td>' +
							'<td>Captured</td>' +
							'<td>Difficulty</td>' +
							'<td>Priority</td>' +
						'</tr>' +
					'</thead>' +
				'</table>' +
			'</div>' +
		'</div>' +
	'</div>';

	$J('<div>').css({
		'position': 'absolute',
		'left': '0',
		'top': '0',
		'width': '100%',
		'z-index': '998',
		'background-color': '#FFF'
	}).html(mainContent).appendTo('body');

	$J('#dataTableButton').click(function() {
		if($J('#dataTableContainer').is(':visible')) {
			$J('#dataTableContainer').hide();
		} else {
			$J('#dataTableContainer').show();
		}
	});

	var dataTable = $J('#planetsDataTable').DataTable({
		dom: 'rt',
		paging: false,
		order: [[1, 'asc']],
		scrollX: true,
		columns: [
			{
				targets: 0,
				className: 'planetDetail',
				orderable: false,
				data: null,
				defaultContent: '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true" style="cursor: pointer;"></span>'
			},
			{
				targets: 1,
				data: 'id'
			},
			{
				targets: 2,
				data: 'name'
			},
			{
				targets: 3,
				data: 'currentPlayers'
			},
			{
				targets: 4,
				data: function(row, type) {
					return row.zonesCaptured + ' / ' + row.totalZones;
				}
			},
			{
				targets: 5,
				data: function(row, type) {
					return row.lowZonesCaptured + ' / ' + row.lowZones;
				}
			},
			{
				targets: 6,
				data: function(row, type) {
					return row.mediumZonesCaptured + ' / ' + row.mediumZones;
				}
			},
			{
				targets: 7,
				data: function(row, type) {
					return row.highZonesCaptured + ' / ' + row.highZones;
				}
			},
			{
				targets: 8,
				data: function(row, type) {
					return (row.captureProgress * 100).toFixed(2) + '%';
				}
			},
			{
				targets: 9,
				data: function(row, type) {
					if(row.activationTime > 0) {
						var activationTime = new Date(row.activationTime * 1000);
						var year = activationTime.getFullYear();
						var month = ('0' + (activationTime.getMonth() + 1)).slice(-2);
						var date = ('0' + activationTime.getDate()).slice(-2);
						var hour = ('0' + activationTime.getHours()).slice(-2);
						var minute = ('0' + activationTime.getMinutes()).slice(-2);
						var second = ('0' + activationTime.getSeconds()).slice(-2);

						return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
					}

					return '';
				}
			},
			{
				targets: 10,
				data: function(row, type) {
					if(row.captureTime > 0) {
						var captureTime = new Date(row.captureTime * 1000);
						var year = captureTime.getFullYear();
						var month = ('0' + (captureTime.getMonth() + 1)).slice(-2);
						var date = ('0' + captureTime.getDate()).slice(-2);
						var hour = ('0' + captureTime.getHours()).slice(-2);
						var minute = ('0' + captureTime.getMinutes()).slice(-2);
						var second = ('0' + captureTime.getSeconds()).slice(-2);

						return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
					}

					return '';
				}
			},
			{
				targets: 11,
				data: 'active'
			},
			{
				targets: 12,
				data: 'captured'
			},
			{
				targets: 13,
				data: 'difficulty'
			},
			{
				targets: 14,
				data: 'priority'
			}
		],
		createdRow: function(row, data, index) {
			if(data.unknownZones > 0) {
				$J('td', row).eq(1).css({
					'color': 'red',
					'font-weight': 'bold'
				});
			}

			if(data.lowZonesCaptured == data.lowZones) {
				$J('td', row).eq(5).css('color', 'red');
			} else {
				$J('td', row).eq(5).css('color', 'green');
			}

			if(data.mediumZonesCaptured == data.mediumZones) {
				$J('td', row).eq(6).css('color', 'red');
			} else {
				$J('td', row).eq(6).css('color', 'green');
			}

			if(data.highZonesCaptured == data.highZones) {
				$J('td', row).eq(7).css('color', 'red');
			} else {
				$J('td', row).eq(7).css('color', 'green');
			}

			if(data.active) {
				$J('td', row).eq(11).css('background-color', 'green');
			} else {
				$J('td', row).eq(11).css('background-color', 'red');
			}

			if(data.captured) {
				$J('td', row).eq(12).css('background-color', 'red');
			} else {
				$J('td', row).eq(12).css('background-color', 'green');
			}
		}
	});

	$J('#planetsDataTable tbody').on('click', 'td.planetDetail', function() {
		var tr = $J(this).closest('tr');
		var row = dataTable.row(tr);

		if(row.child.isShown()) {
			$J(this).html('<span class="glyphicon glyphicon-zoom-in" aria-hidden="true" style="cursor: pointer;"></span>');

			row.child.hide();
			tr.removeClass('shown');
		} else {
			$J(this).html('<span class="glyphicon glyphicon-zoom-out" aria-hidden="true" style="cursor: pointer;"></span>');

			var rowId = row.data().id;

			row.child(detailFormat(planetsZones[rowId], rowId)).show();
			tr.addClass('shown');

			$J('#zonesDataTable_' + rowId).DataTable({
				dom: 'rt',
				paging: false,
				scrollY: '400px',
				scrollCollapse: true,
				columnDefs: [
					{
						targets: 4,
						render: function(data, type, row) {
							return (data * 100).toFixed(2) + '%';
						}
					}
				],
				createdRow: function(row, data, index) {
					if(data[1] < 1 || data[1] > 3) {
						$J('td', row).eq(1).css({
							'color': 'red',
							'font-weight': 'bold'
						});
					}

					if(data[2] != 3) {
						$J('td', row).eq(2).css({
							'color': 'red',
							'font-weight': 'bold'
						});
					}

					if(data[3] == 'true') {
						$J('td', row).eq(3).css('background-color', 'red');
					} else {
						$J('td', row).eq(3).css('background-color', 'green');
					}
				}
			});
		}
	});

	function detailFormat(d, rowId) {
		var detailTable = '<table id="zonesDataTable_' + rowId + '" class="table table-striped table-bordered" style="width: 100%;">' +
			'<thead>' +
				'<tr>' +
					'<td>Zone Position</td>' +
					'<td>Difficulty</td>' +
					'<td>Type</td>' +
					'<td>Captured</td>' +
					'<td>Capture Progress</td>' +
				'</tr>' +
			'</thead>' +
		'<tbody>';

		for(var i = 0; i < d.length; i++) {
			detailTable += '<tr>' +
				'<td>' + d[i].zone_position + '</td>' +
				'<td>' + d[i].difficulty + '</td>' +
				'<td>' + d[i].type + '</td>' +
				'<td>' + d[i].captured + '</td>' +
				'<td>' + (d[i].capture_progress || 0) + '</td>' +
				'</tr>';
		}

		detailTable += '</tbody></table>';

		return detailTable;
	}

	getPlanetsData();

	function getPlanetsData() {
		$J.ajax({
			method: 'GET',
			url: 'https://community.steam-api.com/ITerritoryControlMinigameService/GetPlanets/v0001/',
			data: {
				active_only: 0,
				language: 'tchinese'
			}
		}).done(function(result) {
			$J('#gameVersion').html(result.response.game_version);

			var totalPlanets = result.response.planets.length;

			for(var i = 0; i < totalPlanets; i++) {
				$J.ajax({
					method: 'GET',
					url: 'https://community.steam-api.com/ITerritoryControlMinigameService/GetPlanet/v0001/',
					data: {
						id: result.response.planets[i].id,
						language: 'tchinese'
					}
				}).done(function(result) {
					var planet = result.response.planets[0];
					var state = planet.state;
					var zones = planet.zones;

					var lowZones = zones.filter(function(z) { return z.difficulty == 1; });
					var mediumZones = zones.filter(function(z) { return z.difficulty == 2; });
					var highZones = zones.filter(function(z) { return z.difficulty == 3; });

					var unknownZones = zones.filter(function(z) { return z.difficulty < 1 || z.difficulty > 3 || z.type != 3 });

					planetsZones[planet.id] = zones;

					planetsState.push({
						id: planet.id,
						name: state.name,
						zonesCaptured: zones.filter(function(z) { return z.captured; }).length,
						totalZones: zones.length,
						active: state.active,
						captured: state.captured,
						difficulty: state.difficulty,
						priority: state.priority,
						lowZones: lowZones.length,
						mediumZones: mediumZones.length,
						highZones: highZones.length,
						lowZonesCaptured: lowZones.filter(function(z) { return z.captured; }).length,
						mediumZonesCaptured: mediumZones.filter(function(z) { return z.captured; }).length,
						highZonesCaptured: highZones.filter(function(z) { return z.captured; }).length,
						currentPlayers: state.current_players || 0,
						captureProgress: state.capture_progress || 0,
						activationTime: state.activation_time || 0,
						captureTime: state.capture_time || 0,
						unknownZones: unknownZones
					});

					if(planetsState.length == totalPlanets) {
						dataTable.clear().draw();
						dataTable.rows.add(planetsState).draw();

						getPlayerInfo();

						planetsState = [];

						timer = setInterval(function() {
							var minute = ('0' + parseInt(time / 60, 10)).slice(-2);
							var second = ('0' + parseInt(time % 60, 10)).slice(-2);

							$J('#timer').text(minute + ':' + second);

							if(--time < 0) {
								clearInterval(timer);
								timer = null;
								time = 300;

								getPlanetsData();
							}
						}, 1000);
					}
				}).always(function() {

				});
			}
		});
	}

	function getPlayerInfo() {
		$J.ajax({
			method: 'POST',
			url: 'https://community.steam-api.com/ITerritoryControlMinigameService/GetPlayerInfo/v0001/',
			data: {
				access_token: window.gServer.m_WebAPI.m_strOAuth2Token
			}
		}).done(function(result) {
			var activePlanet = result.response.active_planet;
			var activeZonePosition = result.response.active_zone_position || '-';
			var level = result.response.level;

			var score = result.response.score;
			var nextLevelScore = result.response.next_level_score;
			var scorePercentage = 0;

			if(scoreTable[level - 1]) {
				scorePercentage = ((score - scoreTable[level - 1]) / (nextLevelScore - scoreTable[level - 1])) * 100;
			}

			var levelUpEta = '';
			if(activeZonePosition != '-') {
				var zoneDifficulty = planetsZones[activePlanet][activeZonePosition].difficulty;
				var zoneMaxScoreIndex = zoneDifficulty == 1 ? 5 : zoneDifficulty == 2 ? 10 : zoneDifficulty == 3 ? 20 : 0;
				var zoneMaxScore = zoneMaxScoreIndex * 120;

				var levelUpEtaTime = (nextLevelScore - score) / zoneMaxScore * (110 / 60);
				var levelUpEtaHour = Math.floor(levelUpEtaTime / 60);
				var levelUpEtaMinute = Math.floor(levelUpEtaTime % 60);
				levelUpEta = ' (ETA: ' + levelUpEtaHour + 'h ' + levelUpEtaMinute + 'm) ';
			}

			var timeOnPlanetSec = parseInt(result.response.time_on_planet);
			var timeOnPlanetHour = ('0' + (Math.floor(timeOnPlanetSec / 3600) % 24)).slice(-2);
			var timeOnPlanetMinute = ('0' + (Math.floor(timeOnPlanetSec / 60) % 60)).slice(-2);
			var timeOnPlanetSecond = ('0' + (timeOnPlanetSec % 60)).slice(-2);
			var timeOnPlanet = timeOnPlanetHour + ':' + timeOnPlanetMinute + ':' + timeOnPlanetSecond;

			$J('#playerInfo').html('Planet: ' + activePlanet + ' | Zone: ' + activeZonePosition + ' | Level: ' + level + ' | Exp: ' + score + '/' + nextLevelScore + ' (' + scorePercentage.toFixed(2) + '%) ' + levelUpEta + ' | Time on planet: ' + timeOnPlanet);

			var now = new Date();
			var year = now.getFullYear();
			var month = ('0' + (now.getMonth() + 1)).slice(-2);
			var date = ('0' + now.getDate()).slice(-2);
			var hour = ('0' + now.getHours()).slice(-2);
			var minute = ('0' + now.getMinutes()).slice(-2);
			var second = ('0' + now.getSeconds()).slice(-2);
			var latestUpdate = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;

			$J('#latestUpdate').html(latestUpdate);
		});
	}
})();
