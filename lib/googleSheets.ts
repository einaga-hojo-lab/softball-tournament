import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Game, Team, Player, Tournament, LeagueStanding, PlayerStats } from './types';

// Google Sheetsドキュメントの取得
export async function getSpreadsheet() {
  // サービスアカウント認証を使用する場合
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  }

  // API Keyを使用する場合
  if (process.env.GOOGLE_API_KEY) {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, {
      apiKey: process.env.GOOGLE_API_KEY,
    });
    await doc.loadInfo();
    return doc;
  }

  throw new Error('Google Sheets authentication credentials not found');
}

// すべての大会を取得
export async function getTournaments(): Promise<Tournament[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Tournaments'];
    if (!sheet) {
      console.error('Tournaments sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows.map(row => ({
      tournamentId: row.get('tournament_id'),
      tournamentName: row.get('tournament_name'),
      tournamentDate: row.get('tournament_date'),
      status: row.get('status'),
      createdAt: row.get('created_at'),
      archived: row.get('archived') === 'TRUE',
      season: row.get('season'),
      year: parseInt(row.get('year')),
      previousTournamentId: row.get('previous_tournament_id'),
    }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

// 特定の大会を取得
export async function getTournamentById(tournamentId: string): Promise<Tournament | null> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Tournaments'];
    if (!sheet) {
      console.error('Tournaments sheet not found');
      return null;
    }

    const rows = await sheet.getRows();
    const tournament = rows.find(row => row.get('tournament_id') === tournamentId);

    if (!tournament) {
      return null;
    }

    return {
      tournamentId: tournament.get('tournament_id'),
      tournamentName: tournament.get('tournament_name'),
      tournamentDate: tournament.get('tournament_date'),
      status: tournament.get('status'),
      createdAt: tournament.get('created_at'),
      archived: tournament.get('archived') === 'TRUE',
      season: tournament.get('season'),
      year: parseInt(tournament.get('year')),
      previousTournamentId: tournament.get('previous_tournament_id'),
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

// 現在アクティブな大会を取得
export async function getCurrentTournament(): Promise<Tournament | null> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Tournaments'];
    if (!sheet) {
      console.error('Tournaments sheet not found');
      return null;
    }

    const rows = await sheet.getRows();
    const activeTournament = rows.find(row => row.get('status') === 'active');

    if (!activeTournament) {
      return null;
    }

    return {
      tournamentId: activeTournament.get('tournament_id'),
      tournamentName: activeTournament.get('tournament_name'),
      tournamentDate: activeTournament.get('tournament_date'),
      status: activeTournament.get('status'),
      createdAt: activeTournament.get('created_at'),
      archived: activeTournament.get('archived') === 'TRUE',
      season: activeTournament.get('season'),
      year: parseInt(activeTournament.get('year')),
      previousTournamentId: activeTournament.get('previous_tournament_id'),
    };
  } catch (error) {
    console.error('Error fetching current tournament:', error);
    return null;
  }
}

// 新しい大会を作成
export async function createTournament(data: {
  tournamentName: string;
  tournamentDate: string;
  season: string;
  year: number;
  previousTournamentId?: string;
}): Promise<Tournament> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Tournaments'];
    if (!sheet) {
      throw new Error('Tournaments sheet not found');
    }

    // Generate tournament ID
    const tournamentId = `T${data.year}${data.season}`;
    const createdAt = new Date().toISOString();

    // Add new row
    await sheet.addRow({
      tournament_id: tournamentId,
      tournament_name: data.tournamentName,
      tournament_date: data.tournamentDate,
      status: 'draft',
      created_at: createdAt,
      archived: 'FALSE',
      season: data.season,
      year: data.year,
      previous_tournament_id: data.previousTournamentId || '',
    });

    return {
      tournamentId,
      tournamentName: data.tournamentName,
      tournamentDate: data.tournamentDate,
      status: 'draft',
      createdAt,
      archived: false,
      season: data.season,
      year: data.year,
      previousTournamentId: data.previousTournamentId,
    };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

// 大会のステータスを更新
export async function updateTournamentStatus(tournamentId: string, status: string): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Tournaments'];
    if (!sheet) {
      throw new Error('Tournaments sheet not found');
    }

    const rows = await sheet.getRows();
    const tournament = rows.find(row => row.get('tournament_id') === tournamentId);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    tournament.set('status', status);
    await tournament.save();
  } catch (error) {
    console.error('Error updating tournament status:', error);
    throw error;
  }
}

// 大会を削除
export async function deleteTournament(tournamentId: string): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Tournaments'];
    if (!sheet) {
      throw new Error('Tournaments sheet not found');
    }

    const rows = await sheet.getRows();
    const tournament = rows.find(row => row.get('tournament_id') === tournamentId);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    await tournament.delete();
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
}

// 試合一覧を取得
export async function getGames(tournamentId?: string): Promise<Game[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Games'];
    if (!sheet) {
      console.error('Games sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows
      .filter(row => !tournamentId || row.get('tournament_id') === tournamentId)
      .map(row => ({
        gameId: row.get('game_id'),
        tournamentId: row.get('tournament_id'),
        gameType: row.get('game_type'),
        block: row.get('block'),
        round: row.get('round'),
        teamHomeId: row.get('team_home_id'),
        teamAwayId: row.get('team_away_id'),
        scoreHome: parseInt(row.get('score_home') || '0'),
        scoreAway: parseInt(row.get('score_away') || '0'),
        status: row.get('status'),
        scheduledDate: row.get('scheduled_date'),
        scheduledTime: row.get('scheduled_time'),
        actualStartTime: row.get('actual_start_time'),
        actualEndTime: row.get('actual_end_time'),
        groundNumber: parseInt(row.get('ground_number') || '1'),
        referee: row.get('referee'),
        recorder: row.get('recorder'),
      }));
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

// 試合を作成
export async function createGame(
  tournamentId: string,
  gameData: {
    gameType: 'league' | 'tournament';
    block?: string;
    round?: string;
    teamHomeId: string;
    teamAwayId: string;
    scoreHome?: number;
    scoreAway?: number;
    status?: string;
    scheduledDate: string;
    scheduledTime: string;
    actualStartTime?: string;
    actualEndTime?: string;
    groundNumber?: number;
    referee?: string;
    recorder?: string;
  }
): Promise<Game> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Games'];
    if (!sheet) {
      throw new Error('Games sheet not found');
    }

    // 新しい試合IDを生成
    const rows = await sheet.getRows();
    const gameIds = rows
      .filter(row => row.get('tournament_id') === tournamentId)
      .map(row => {
        const id = row.get('game_id');
        const match = id?.match(/GAME(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    const maxId = gameIds.length > 0 ? Math.max(...gameIds) : 0;
    const newGameId = `GAME${String(maxId + 1).padStart(3, '0')}`;

    // 新しい行を追加
    await sheet.addRow({
      tournament_id: tournamentId,
      game_id: newGameId,
      game_type: gameData.gameType,
      block: gameData.block || '',
      round: gameData.round || '',
      team_home_id: gameData.teamHomeId,
      team_away_id: gameData.teamAwayId,
      score_home: gameData.scoreHome?.toString() || '0',
      score_away: gameData.scoreAway?.toString() || '0',
      status: gameData.status || 'scheduled',
      scheduled_date: gameData.scheduledDate,
      scheduled_time: gameData.scheduledTime,
      actual_start_time: gameData.actualStartTime || '',
      actual_end_time: gameData.actualEndTime || '',
      ground_number: gameData.groundNumber?.toString() || '1',
      referee: gameData.referee || '',
      recorder: gameData.recorder || '',
    });

    return {
      gameId: newGameId,
      tournamentId,
      gameType: gameData.gameType,
      block: gameData.block,
      round: gameData.round,
      teamHomeId: gameData.teamHomeId,
      teamAwayId: gameData.teamAwayId,
      scoreHome: gameData.scoreHome || 0,
      scoreAway: gameData.scoreAway || 0,
      status: (gameData.status || 'scheduled') as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed',
      scheduledDate: gameData.scheduledDate,
      scheduledTime: gameData.scheduledTime,
      actualStartTime: gameData.actualStartTime,
      actualEndTime: gameData.actualEndTime,
      groundNumber: gameData.groundNumber || 1,
      referee: gameData.referee || '',
      recorder: gameData.recorder || '',
    };
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
}

// 試合を更新
export async function updateGame(
  tournamentId: string,
  gameId: string,
  gameData: {
    gameType?: 'league' | 'tournament';
    block?: string;
    round?: string;
    teamHomeId?: string;
    teamAwayId?: string;
    scoreHome?: number;
    scoreAway?: number;
    status?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    groundNumber?: number;
    referee?: string;
    recorder?: string;
  }
): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Games'];
    if (!sheet) {
      throw new Error('Games sheet not found');
    }

    const rows = await sheet.getRows();
    const gameRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('game_id') === gameId
    );

    if (!gameRow) {
      throw new Error('Game not found');
    }

    // 更新
    if (gameData.gameType !== undefined) gameRow.set('game_type', gameData.gameType);
    if (gameData.block !== undefined) gameRow.set('block', gameData.block);
    if (gameData.round !== undefined) gameRow.set('round', gameData.round);
    if (gameData.teamHomeId !== undefined) gameRow.set('team_home_id', gameData.teamHomeId);
    if (gameData.teamAwayId !== undefined) gameRow.set('team_away_id', gameData.teamAwayId);
    if (gameData.scoreHome !== undefined) gameRow.set('score_home', gameData.scoreHome.toString());
    if (gameData.scoreAway !== undefined) gameRow.set('score_away', gameData.scoreAway.toString());
    if (gameData.status !== undefined) gameRow.set('status', gameData.status);
    if (gameData.scheduledDate !== undefined) gameRow.set('scheduled_date', gameData.scheduledDate);
    if (gameData.scheduledTime !== undefined) gameRow.set('scheduled_time', gameData.scheduledTime);
    if (gameData.actualStartTime !== undefined) gameRow.set('actual_start_time', gameData.actualStartTime);
    if (gameData.actualEndTime !== undefined) gameRow.set('actual_end_time', gameData.actualEndTime);
    if (gameData.groundNumber !== undefined) gameRow.set('ground_number', gameData.groundNumber.toString());
    if (gameData.referee !== undefined) gameRow.set('referee', gameData.referee);
    if (gameData.recorder !== undefined) gameRow.set('recorder', gameData.recorder);

    await gameRow.save();
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
}

// 試合を削除
export async function deleteGame(tournamentId: string, gameId: string): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Games'];
    if (!sheet) {
      throw new Error('Games sheet not found');
    }

    const rows = await sheet.getRows();
    const gameRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('game_id') === gameId
    );

    if (!gameRow) {
      throw new Error('Game not found');
    }

    await gameRow.delete();
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
}

// 試合スコアを更新
export async function updateGameScore(
  tournamentId: string,
  gameId: string,
  scoreData: {
    scoreHome: number;
    scoreAway: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  }
): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Games'];
    if (!sheet) {
      throw new Error('Games sheet not found');
    }

    const rows = await sheet.getRows();
    const gameRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('game_id') === gameId
    );

    if (!gameRow) {
      throw new Error('Game not found');
    }

    gameRow.set('score_home', scoreData.scoreHome.toString());
    gameRow.set('score_away', scoreData.scoreAway.toString());
    gameRow.set('status', scoreData.status);

    await gameRow.save();
  } catch (error) {
    console.error('Error updating game score:', error);
    throw error;
  }
}

// チーム一覧を取得
export async function getTeams(tournamentId?: string): Promise<Team[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Teams'];
    if (!sheet) {
      console.error('Teams sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows
      .filter(row => !tournamentId || row.get('tournament_id') === tournamentId)
      .map(row => ({
        teamId: row.get('team_id'),
        tournamentId: row.get('tournament_id'),
        teamName: row.get('team_name'),
        block: row.get('block'),
        combinedTeam: row.get('combined_team') === 'TRUE',
        seedRank: row.get('seed_rank') ? parseInt(row.get('seed_rank')) : undefined,
        previousRank: row.get('previous_rank') ? parseInt(row.get('previous_rank')) : undefined,
        autoAssigned: row.get('auto_assigned') === 'TRUE',
        captainName: row.get('captain_name'),
        captainEmail: row.get('captain_email'),
        memberCount: parseInt(row.get('member_count') || '0'),
        notes: row.get('notes'),
      }));
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

// チームを作成
export async function createTeam(
  tournamentId: string,
  teamData: {
    teamName: string;
    block?: string;
    combinedTeam?: boolean;
    seedRank?: number;
    previousRank?: number;
    captainName?: string;
    captainEmail?: string;
    memberCount?: number;
    notes?: string;
  }
): Promise<Team> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Teams'];
    if (!sheet) {
      throw new Error('Teams sheet not found');
    }

    // 新しいチームIDを生成（既存のチームIDから最大値を取得して+1）
    const rows = await sheet.getRows();
    const teamIds = rows
      .filter(row => row.get('tournament_id') === tournamentId)
      .map(row => {
        const id = row.get('team_id');
        const match = id?.match(/TEAM(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    const maxId = teamIds.length > 0 ? Math.max(...teamIds) : 0;
    const newTeamId = `TEAM${String(maxId + 1).padStart(3, '0')}`;

    // 新しい行を追加
    const newRow = await sheet.addRow({
      tournament_id: tournamentId,
      team_id: newTeamId,
      team_name: teamData.teamName,
      block: teamData.block || '',
      combined_team: teamData.combinedTeam ? 'TRUE' : 'FALSE',
      seed_rank: teamData.seedRank?.toString() || '',
      previous_rank: teamData.previousRank?.toString() || '',
      auto_assigned: 'FALSE',
      captain_name: teamData.captainName || '',
      captain_email: teamData.captainEmail || '',
      member_count: teamData.memberCount?.toString() || '0',
      notes: teamData.notes || '',
    });

    return {
      teamId: newTeamId,
      tournamentId,
      teamName: teamData.teamName,
      block: teamData.block || undefined,
      combinedTeam: teamData.combinedTeam || false,
      seedRank: teamData.seedRank || undefined,
      previousRank: teamData.previousRank || undefined,
      autoAssigned: false,
      captainName: teamData.captainName || undefined,
      captainEmail: teamData.captainEmail || undefined,
      memberCount: teamData.memberCount || 0,
      notes: teamData.notes || undefined,
    };
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

// チームを更新
export async function updateTeam(
  tournamentId: string,
  teamId: string,
  teamData: {
    teamName?: string;
    block?: string;
    combinedTeam?: boolean;
    seedRank?: number;
    previousRank?: number;
    captainName?: string;
    captainEmail?: string;
    memberCount?: number;
    notes?: string;
  }
): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Teams'];
    if (!sheet) {
      throw new Error('Teams sheet not found');
    }

    const rows = await sheet.getRows();
    const teamRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('team_id') === teamId
    );

    if (!teamRow) {
      throw new Error('Team not found');
    }

    // 更新
    if (teamData.teamName !== undefined) teamRow.set('team_name', teamData.teamName);
    if (teamData.block !== undefined) teamRow.set('block', teamData.block);
    if (teamData.combinedTeam !== undefined) teamRow.set('combined_team', teamData.combinedTeam ? 'TRUE' : 'FALSE');
    if (teamData.seedRank !== undefined) teamRow.set('seed_rank', teamData.seedRank.toString());
    if (teamData.previousRank !== undefined) teamRow.set('previous_rank', teamData.previousRank.toString());
    if (teamData.captainName !== undefined) teamRow.set('captain_name', teamData.captainName);
    if (teamData.captainEmail !== undefined) teamRow.set('captain_email', teamData.captainEmail);
    if (teamData.memberCount !== undefined) teamRow.set('member_count', teamData.memberCount.toString());
    if (teamData.notes !== undefined) teamRow.set('notes', teamData.notes);

    await teamRow.save();
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
}

// チームを削除
export async function deleteTeam(tournamentId: string, teamId: string): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Teams'];
    if (!sheet) {
      throw new Error('Teams sheet not found');
    }

    const rows = await sheet.getRows();
    const teamRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('team_id') === teamId
    );

    if (!teamRow) {
      throw new Error('Team not found');
    }

    await teamRow.delete();
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
}

// 選手一覧を取得
export async function getPlayers(tournamentId?: string): Promise<Player[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Players'];
    if (!sheet) {
      console.error('Players sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows
      .filter(row => !tournamentId || row.get('tournament_id') === tournamentId)
      .map(row => ({
        playerId: row.get('player_id'),
        tournamentId: row.get('tournament_id'),
        teamId: row.get('team_id'),
        playerName: row.get('player_name'),
        uniformNumber: parseInt(row.get('uniform_number') || '0'),
        position: row.get('position'),
        participantId: row.get('participant_id'),
      }));
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

// 選手を作成
export async function createPlayer(
  tournamentId: string,
  playerData: {
    teamId: string;
    playerName: string;
    uniformNumber?: number;
    position?: string;
    participantId?: string;
  }
): Promise<Player> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Players'];
    if (!sheet) {
      throw new Error('Players sheet not found');
    }

    // 新しい選手IDを生成
    const rows = await sheet.getRows();
    const playerIds = rows
      .filter(row => row.get('tournament_id') === tournamentId)
      .map(row => {
        const id = row.get('player_id');
        const match = id?.match(/PLAYER(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    const maxId = playerIds.length > 0 ? Math.max(...playerIds) : 0;
    const newPlayerId = `PLAYER${String(maxId + 1).padStart(3, '0')}`;

    // 新しい行を追加
    await sheet.addRow({
      tournament_id: tournamentId,
      player_id: newPlayerId,
      team_id: playerData.teamId,
      player_name: playerData.playerName,
      uniform_number: playerData.uniformNumber?.toString() || '0',
      position: playerData.position || '',
      participant_id: playerData.participantId || '',
    });

    return {
      playerId: newPlayerId,
      tournamentId,
      teamId: playerData.teamId,
      playerName: playerData.playerName,
      uniformNumber: playerData.uniformNumber || 0,
      position: playerData.position || '',
      participantId: playerData.participantId,
    };
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
}

// 選手を更新
export async function updatePlayer(
  tournamentId: string,
  playerId: string,
  playerData: {
    teamId?: string;
    playerName?: string;
    uniformNumber?: number;
    position?: string;
    participantId?: string;
  }
): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Players'];
    if (!sheet) {
      throw new Error('Players sheet not found');
    }

    const rows = await sheet.getRows();
    const playerRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('player_id') === playerId
    );

    if (!playerRow) {
      throw new Error('Player not found');
    }

    // 更新
    if (playerData.teamId !== undefined) playerRow.set('team_id', playerData.teamId);
    if (playerData.playerName !== undefined) playerRow.set('player_name', playerData.playerName);
    if (playerData.uniformNumber !== undefined) playerRow.set('uniform_number', playerData.uniformNumber.toString());
    if (playerData.position !== undefined) playerRow.set('position', playerData.position);
    if (playerData.participantId !== undefined) playerRow.set('participant_id', playerData.participantId);

    await playerRow.save();
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}

// 選手を削除
export async function deletePlayer(tournamentId: string, playerId: string): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Players'];
    if (!sheet) {
      throw new Error('Players sheet not found');
    }

    const rows = await sheet.getRows();
    const playerRow = rows.find(
      row => row.get('tournament_id') === tournamentId && row.get('player_id') === playerId
    );

    if (!playerRow) {
      throw new Error('Player not found');
    }

    await playerRow.delete();
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}

// リーグ順位表を取得
export async function getLeagueStandings(tournamentId: string): Promise<LeagueStanding[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['LeagueStandings'];
    if (!sheet) {
      console.error('LeagueStandings sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows
      .filter(row => row.get('tournament_id') === tournamentId)
      .map(row => ({
        tournamentId: row.get('tournament_id'),
        block: row.get('block'),
        teamId: row.get('team_id'),
        games: parseInt(row.get('games') || '0'),
        wins: parseInt(row.get('wins') || '0'),
        losses: parseInt(row.get('losses') || '0'),
        draws: parseInt(row.get('draws') || '0'),
        winRate: parseFloat(row.get('win_rate') || '0'),
        pointsFor: parseInt(row.get('points_for') || '0'),
        pointsAgainst: parseInt(row.get('points_against') || '0'),
        rank: parseInt(row.get('rank') || '0'),
      }));
  } catch (error) {
    console.error('Error fetching league standings:', error);
    return [];
  }
}

// 個人成績を取得
export async function getPlayerStats(tournamentId: string): Promise<PlayerStats[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['PlayerStats'];
    if (!sheet) {
      console.error('PlayerStats sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows
      .filter(row => row.get('tournament_id') === tournamentId)
      .map(row => ({
        tournamentId: row.get('tournament_id'),
        playerId: row.get('player_id'),
        playerName: row.get('player_name'),
        teamId: row.get('team_id'),
        atBats: parseInt(row.get('at_bats') || '0'),
        hits: parseInt(row.get('hits') || '0'),
        homeruns: parseInt(row.get('homeruns') || '0'),
        rbis: parseInt(row.get('rbis') || '0'),
        strikeouts: parseInt(row.get('strikeouts') || '0'),
        battingAverage: parseFloat(row.get('batting_average') || '0'),
      }));
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return [];
  }
}
