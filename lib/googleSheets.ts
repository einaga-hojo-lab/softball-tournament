import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Game, Team, Player, Tournament, LeagueStanding, PlayerStats, TeamStats, Participant, PaymentSummary, TournamentBracket, Inning, AtBat, AtBatResult } from './types';

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
// リーグ順位表を試合結果から自動計算
export async function calculateLeagueStandings(tournamentId: string): Promise<LeagueStanding[]> {
  try {
    const doc = await getSpreadsheet();
    const gamesSheet = doc.sheetsByTitle['Games'];
    const teamsSheet = doc.sheetsByTitle['Teams'];

    if (!gamesSheet || !teamsSheet) {
      console.error('Required sheets not found');
      return [];
    }

    const games = await gamesSheet.getRows();
    const teams = await teamsSheet.getRows();

    // リーグ戦の完了した試合のみを対象
    const completedLeagueGames = games.filter(
      row =>
        row.get('tournament_id') === tournamentId &&
        row.get('game_type') === 'league' &&
        row.get('status') === 'completed' &&
        row.get('block') // ブロックが設定されている
    );

    // ブロック別にチームの統計を計算
    const standingsMap = new Map<string, Map<string, {
      teamId: string;
      block: string;
      games: number;
      wins: number;
      losses: number;
      draws: number;
      pointsFor: number;
      pointsAgainst: number;
    }>>();

    // チーム情報を取得してマップに追加
    teams
      .filter(row => row.get('tournament_id') === tournamentId && row.get('block'))
      .forEach(team => {
        const teamId = team.get('team_id');
        const block = team.get('block');

        if (!standingsMap.has(block)) {
          standingsMap.set(block, new Map());
        }

        standingsMap.get(block)!.set(teamId, {
          teamId,
          block,
          games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        });
      });

    // 試合結果から統計を計算
    completedLeagueGames.forEach(game => {
      const block = game.get('block');
      const teamHomeId = game.get('team_home_id');
      const teamAwayId = game.get('team_away_id');
      const scoreHome = parseInt(game.get('score_home') || '0');
      const scoreAway = parseInt(game.get('score_away') || '0');

      const blockMap = standingsMap.get(block);
      if (!blockMap) return;

      const homeStats = blockMap.get(teamHomeId);
      const awayStats = blockMap.get(teamAwayId);

      if (homeStats) {
        homeStats.games++;
        homeStats.pointsFor += scoreHome;
        homeStats.pointsAgainst += scoreAway;

        if (scoreHome > scoreAway) homeStats.wins++;
        else if (scoreHome < scoreAway) homeStats.losses++;
        else homeStats.draws++;
      }

      if (awayStats) {
        awayStats.games++;
        awayStats.pointsFor += scoreAway;
        awayStats.pointsAgainst += scoreHome;

        if (scoreAway > scoreHome) awayStats.wins++;
        else if (scoreAway < scoreHome) awayStats.losses++;
        else awayStats.draws++;
      }
    });

    // 最終的な順位表を作成
    const standings: LeagueStanding[] = [];

    standingsMap.forEach((blockMap, block) => {
      const blockStandings = Array.from(blockMap.values())
        .map(stats => ({
          tournamentId,
          block,
          teamId: stats.teamId,
          games: stats.games,
          wins: stats.wins,
          losses: stats.losses,
          draws: stats.draws,
          winRate: stats.games > 0 ? stats.wins / stats.games : 0,
          pointsFor: stats.pointsFor,
          pointsAgainst: stats.pointsAgainst,
          rank: 0, // 仮の値、後で設定
        }))
        .sort((a, b) => {
          // 勝率で降順ソート、同率の場合は得失点差
          if (b.winRate !== a.winRate) return b.winRate - a.winRate;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });

      // 順位を設定
      blockStandings.forEach((standing, index) => {
        standing.rank = index + 1;
      });

      standings.push(...blockStandings);
    });

    return standings;
  } catch (error) {
    console.error('Error calculating league standings:', error);
    return [];
  }
}

export async function getLeagueStandings(tournamentId: string): Promise<LeagueStanding[]> {
  // 試合結果から自動計算
  return await calculateLeagueStandings(tournamentId);
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

export async function getTeamStats(tournamentId: string): Promise<TeamStats[]> {
  try {
    const doc = await getSpreadsheet();
    const gamesSheet = doc.sheetsByTitle['Games'];
    const teamsSheet = doc.sheetsByTitle['Teams'];

    if (!gamesSheet || !teamsSheet) {
      console.error('Required sheets not found');
      return [];
    }

    const games = await gamesSheet.getRows();
    const teams = await teamsSheet.getRows();

    // フィルタリングされた試合データ（完了した試合のみ）
    const completedGames = games.filter(
      row => row.get('tournament_id') === tournamentId && row.get('status') === 'completed'
    );

    // チームごとの統計を計算
    const teamStatsMap = new Map<string, {
      teamId: string;
      teamName: string;
      gamesPlayed: number;
      wins: number;
      losses: number;
      draws: number;
      runsScored: number;
      runsAllowed: number;
    }>();

    // チーム情報を取得
    teams
      .filter(row => row.get('tournament_id') === tournamentId)
      .forEach(team => {
        const teamId = team.get('team_id');
        teamStatsMap.set(teamId, {
          teamId,
          teamName: team.get('team_name'),
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          runsScored: 0,
          runsAllowed: 0,
        });
      });

    // 試合結果から統計を計算
    completedGames.forEach(game => {
      const teamHomeId = game.get('team_home_id');
      const teamAwayId = game.get('team_away_id');
      const scoreHome = parseInt(game.get('score_home') || '0');
      const scoreAway = parseInt(game.get('score_away') || '0');

      const homeStats = teamStatsMap.get(teamHomeId);
      const awayStats = teamStatsMap.get(teamAwayId);

      if (homeStats) {
        homeStats.gamesPlayed++;
        homeStats.runsScored += scoreHome;
        homeStats.runsAllowed += scoreAway;

        if (scoreHome > scoreAway) homeStats.wins++;
        else if (scoreHome < scoreAway) homeStats.losses++;
        else homeStats.draws++;
      }

      if (awayStats) {
        awayStats.gamesPlayed++;
        awayStats.runsScored += scoreAway;
        awayStats.runsAllowed += scoreHome;

        if (scoreAway > scoreHome) awayStats.wins++;
        else if (scoreAway < scoreHome) awayStats.losses++;
        else awayStats.draws++;
      }
    });

    // 最終的な統計を作成
    return Array.from(teamStatsMap.values()).map(stats => ({
      tournamentId,
      teamId: stats.teamId,
      teamName: stats.teamName,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      runsScored: stats.runsScored,
      runsAllowed: stats.runsAllowed,
      runDifferential: stats.runsScored - stats.runsAllowed,
      winRate: stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0,
    }));
  } catch (error) {
    console.error('Error calculating team stats:', error);
    return [];
  }
}

// ===== 参加者管理 =====

export async function getParticipants(tournamentId: string): Promise<Participant[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Participants'];
    if (!sheet) {
      console.error('Participants sheet not found');
      return [];
    }

    const rows = await sheet.getRows();

    return rows
      .filter(row => row.get('tournament_id') === tournamentId)
      .map(row => ({
        participantId: row.get('participant_id'),
        tournamentId: row.get('tournament_id'),
        teamName: row.get('team_name'),
        playerName: row.get('player_name'),
        email: row.get('email'),
        phone: row.get('phone'),
        paymentStatus: row.get('payment_status') as 'unpaid' | 'paid' | 'refunded' | 'exempted',
        paymentMethod: row.get('payment_method') || undefined,
        paymentDate: row.get('payment_date') || undefined,
        paymentAmount: parseFloat(row.get('payment_amount') || '0'),
        registrationDate: row.get('registration_date'),
        notes: row.get('notes') || undefined,
      }));
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
}

export async function createParticipant(
  tournamentId: string,
  participantData: Omit<Participant, 'participantId' | 'tournamentId'>
): Promise<Participant> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Participants'];
  if (!sheet) {
    throw new Error('Participants sheet not found');
  }

  const rows = await sheet.getRows();

  // 既存の参加者IDを取得
  const participantIds = rows
    .map(row => {
      const id = row.get('participant_id');
      if (id && id.startsWith('PART')) {
        return parseInt(id.substring(4));
      }
      return 0;
    })
    .filter(id => !isNaN(id));

  // 新しい参加者IDを生成
  const maxId = participantIds.length > 0 ? Math.max(...participantIds) : 0;
  const newParticipantId = `PART${String(maxId + 1).padStart(3, '0')}`;

  // 新しい行を追加
  await sheet.addRow({
    participant_id: newParticipantId,
    tournament_id: tournamentId,
    team_name: participantData.teamName,
    player_name: participantData.playerName,
    email: participantData.email,
    phone: participantData.phone,
    payment_status: participantData.paymentStatus,
    payment_method: participantData.paymentMethod || '',
    payment_date: participantData.paymentDate || '',
    payment_amount: participantData.paymentAmount,
    registration_date: participantData.registrationDate,
    notes: participantData.notes || '',
  });

  return {
    participantId: newParticipantId,
    tournamentId,
    ...participantData,
  };
}

export async function updateParticipant(
  tournamentId: string,
  participantId: string,
  participantData: Partial<Omit<Participant, 'participantId' | 'tournamentId'>>
): Promise<void> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Participants'];
  if (!sheet) {
    throw new Error('Participants sheet not found');
  }

  const rows = await sheet.getRows();
  const row = rows.find(
    r => r.get('participant_id') === participantId && r.get('tournament_id') === tournamentId
  );

  if (!row) {
    throw new Error('Participant not found');
  }

  // 更新するフィールド
  if (participantData.teamName !== undefined) row.set('team_name', participantData.teamName);
  if (participantData.playerName !== undefined) row.set('player_name', participantData.playerName);
  if (participantData.email !== undefined) row.set('email', participantData.email);
  if (participantData.phone !== undefined) row.set('phone', participantData.phone);
  if (participantData.paymentStatus !== undefined) row.set('payment_status', participantData.paymentStatus);
  if (participantData.paymentMethod !== undefined) row.set('payment_method', participantData.paymentMethod);
  if (participantData.paymentDate !== undefined) row.set('payment_date', participantData.paymentDate);
  if (participantData.paymentAmount !== undefined) row.set('payment_amount', participantData.paymentAmount);
  if (participantData.notes !== undefined) row.set('notes', participantData.notes);

  await row.save();
}

export async function deleteParticipant(tournamentId: string, participantId: string): Promise<void> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Participants'];
  if (!sheet) {
    throw new Error('Participants sheet not found');
  }

  const rows = await sheet.getRows();
  const row = rows.find(
    r => r.get('participant_id') === participantId && r.get('tournament_id') === tournamentId
  );

  if (!row) {
    throw new Error('Participant not found');
  }

  await row.delete();
}

export async function getPaymentSummary(tournamentId: string): Promise<PaymentSummary> {
  try {
    const participants = await getParticipants(tournamentId);

    const totalParticipants = participants.length;
    const paidCount = participants.filter(p => p.paymentStatus === 'paid').length;
    const unpaidCount = participants.filter(p => p.paymentStatus === 'unpaid').length;
    const totalCollected = participants
      .filter(p => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.paymentAmount, 0);
    const totalExpected = participants
      .filter(p => p.paymentStatus !== 'exempted' && p.paymentStatus !== 'refunded')
      .reduce((sum, p) => sum + p.paymentAmount, 0);
    const collectionRate = totalExpected > 0 ? totalCollected / totalExpected : 0;

    return {
      tournamentId,
      totalParticipants,
      paidCount,
      unpaidCount,
      totalCollected,
      totalExpected,
      collectionRate,
    };
  } catch (error) {
    console.error('Error calculating payment summary:', error);
    throw error;
  }
}

// ===== スケジュール検証 =====

export interface ScheduleConflict {
  type: 'team_overlap' | 'field_overlap';
  gameId1: string;
  gameId2: string;
  details: string;
}

export async function validateSchedule(tournamentId: string): Promise<ScheduleConflict[]> {
  try {
    const doc = await getSpreadsheet();
    const gamesSheet = doc.sheetsByTitle['Games'];
    if (!gamesSheet) {
      console.error('Games sheet not found');
      return [];
    }

    const rows = await gamesSheet.getRows();
    const games = rows
      .filter(row =>
        row.get('tournament_id') === tournamentId &&
        row.get('status') !== 'cancelled' &&
        row.get('status') !== 'postponed' &&
        row.get('scheduled_date') &&
        row.get('scheduled_time')
      )
      .map(row => ({
        gameId: row.get('game_id'),
        teamHomeId: row.get('team_home_id'),
        teamAwayId: row.get('team_away_id'),
        scheduledDate: row.get('scheduled_date'),
        scheduledTime: row.get('scheduled_time'),
        field: row.get('field'),
      }));

    const conflicts: ScheduleConflict[] = [];

    // 全ての試合ペアをチェック
    for (let i = 0; i < games.length; i++) {
      for (let j = i + 1; j < games.length; j++) {
        const game1 = games[i];
        const game2 = games[j];

        // 同じ日付かチェック
        if (game1.scheduledDate !== game2.scheduledDate) continue;

        // 時間が重複しているかチェック（簡易版 - 同じ時間のみ）
        if (game1.scheduledTime === game2.scheduledTime) {
          // チームの重複をチェック
          const teams1 = [game1.teamHomeId, game1.teamAwayId];
          const teams2 = [game2.teamHomeId, game2.teamAwayId];
          const teamOverlap = teams1.some(t => teams2.includes(t));

          if (teamOverlap) {
            const overlappingTeams = teams1.filter(t => teams2.includes(t));
            conflicts.push({
              type: 'team_overlap',
              gameId1: game1.gameId,
              gameId2: game2.gameId,
              details: `チーム ${overlappingTeams.join(', ')} が ${game1.scheduledDate} ${game1.scheduledTime} に複数の試合に出場予定`,
            });
          }

          // 会場の重複をチェック
          if (game1.field && game2.field && game1.field === game2.field) {
            conflicts.push({
              type: 'field_overlap',
              gameId1: game1.gameId,
              gameId2: game2.gameId,
              details: `会場 ${game1.field} が ${game1.scheduledDate} ${game1.scheduledTime} に重複予約`,
            });
          }
        }
      }
    }

    return conflicts;
  } catch (error) {
    console.error('Error validating schedule:', error);
    return [];
  }
}

// ===== トーナメント表管理 =====

export async function generateTournamentBracket(
  tournamentId: string,
  teamIds: string[],
  useSeedRanking: boolean = false
): Promise<TournamentBracket[]> {
  try {
    const doc = await getSpreadsheet();
    const teamsSheet = doc.sheetsByTitle['Teams'];
    const gamesSheet = doc.sheetsByTitle['Games'];

    if (!teamsSheet || !gamesSheet) {
      throw new Error('Required sheets not found');
    }

    const actualTeamCount = teamIds.length;
    if (actualTeamCount < 2) {
      throw new Error(`トーナメントには最低2チームが必要です（現在: ${actualTeamCount}チーム）`);
    }

    // 次の2のべき乗を計算（4, 8, 16, 32...）
    let bracketSize = 4;
    while (bracketSize < actualTeamCount) {
      bracketSize *= 2;
    }

    // 不戦勝の数を計算
    const byeCount = bracketSize - actualTeamCount;

    // チーム情報を取得
    const teamRows = await teamsSheet.getRows();
    const teams = teamRows
      .filter(row => teamIds.includes(row.get('team_id')))
      .map(row => ({
        teamId: row.get('team_id'),
        teamName: row.get('team_name'),
        seedRank: parseInt(row.get('seed_rank') || '999'),
      }));

    // シード順またはランダムに並べ替え
    let orderedTeams = [...teams];
    if (useSeedRanking) {
      orderedTeams.sort((a, b) => a.seedRank - b.seedRank);
    } else {
      // ランダムシャッフル
      for (let i = orderedTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [orderedTeams[i], orderedTeams[j]] = [orderedTeams[j], orderedTeams[i]];
      }
    }

    // 不戦勝を上位シードに配置する
    // 実際のトーナメントでは、不戦勝は上位シードに割り当てられる
    const slots: Array<{ teamId: string; teamName: string } | null> = [];

    // まず全スロットを用意
    for (let i = 0; i < bracketSize; i++) {
      slots.push(null);
    }

    // チームを配置
    for (let i = 0; i < orderedTeams.length; i++) {
      slots[i] = orderedTeams[i];
    }

    // 残りのスロットにBYEを配置
    for (let i = orderedTeams.length; i < bracketSize; i++) {
      slots[i] = { teamId: 'BYE', teamName: '不戦勝' };
    }

    // トーナメント表を生成（全ラウンドの枠を作成）
    const brackets: TournamentBracket[] = [];
    const gameRows = await gamesSheet.getRows();

    // 既存のゲームIDを取得
    const gameIds = gameRows
      .map(row => {
        const id = row.get('game_id');
        if (id && id.startsWith('GAME')) {
          return parseInt(id.substring(4));
        }
        return 0;
      })
      .filter(id => !isNaN(id));

    let maxGameId = gameIds.length > 0 ? Math.max(...gameIds) : 0;

    // ラウンド構造を計算
    const rounds = Math.log2(bracketSize);
    const roundNames: string[] = [];

    if (rounds === 1) {
      roundNames.push('決勝');
    } else if (rounds === 2) {
      roundNames.push('準決勝', '決勝');
    } else if (rounds === 3) {
      roundNames.push('準々決勝', '準決勝', '決勝');
    } else if (rounds === 4) {
      roundNames.push('2回戦', '準々決勝', '準決勝', '決勝');
    } else if (rounds >= 5) {
      roundNames.push('1回戦');
      for (let i = 2; i < rounds - 2; i++) {
        roundNames.push(`${i}回戦`);
      }
      roundNames.push('準々決勝', '準決勝', '決勝');
    }

    // 1回戦の試合を作成（実チーム配置）
    const firstRoundMatches = bracketSize / 2;
    for (let i = 0; i < firstRoundMatches; i++) {
      const team1 = slots[i * 2];
      const team2 = slots[i * 2 + 1];

      if (!team1 || !team2) continue;

      maxGameId++;
      const gameId = `GAME${String(maxGameId).padStart(3, '0')}`;

      // BYEが含まれる場合は自動的に完了状態にする
      const isByeMatch = team1.teamId === 'BYE' || team2.teamId === 'BYE';
      const status = isByeMatch ? 'completed' : 'scheduled';
      const scoreHome = isByeMatch ? (team1.teamId === 'BYE' ? 0 : 1) : 0;
      const scoreAway = isByeMatch ? (team2.teamId === 'BYE' ? 0 : 1) : 0;

      // Gamesシートに試合を追加
      await gamesSheet.addRow({
        game_id: gameId,
        tournament_id: tournamentId,
        game_type: 'tournament',
        round: roundNames[0],
        team_home_id: team1.teamId,
        team_away_id: team2.teamId,
        scheduled_date: '',
        scheduled_time: '',
        field: '',
        status,
        score_home: scoreHome,
        score_away: scoreAway,
        recorder: isByeMatch ? 'AUTO' : '',
      });

      brackets.push({
        tournamentId,
        round: roundNames[0],
        matchNumber: i + 1,
        team1Id: team1.teamId,
        team2Id: team2.teamId,
        gameId,
        winnerId: isByeMatch ? (team1.teamId === 'BYE' ? team2.teamId : team1.teamId) : undefined,
        score1: scoreHome,
        score2: scoreAway,
      });
    }

    // 2回戦以降の枠を作成（TBD）
    let currentRoundMatches = firstRoundMatches;
    for (let roundIndex = 1; roundIndex < roundNames.length; roundIndex++) {
      currentRoundMatches = currentRoundMatches / 2;
      const roundName = roundNames[roundIndex];

      for (let i = 0; i < currentRoundMatches; i++) {
        maxGameId++;
        const gameId = `GAME${String(maxGameId).padStart(3, '0')}`;

        await gamesSheet.addRow({
          game_id: gameId,
          tournament_id: tournamentId,
          game_type: 'tournament',
          round: roundName,
          team_home_id: 'TBD',
          team_away_id: 'TBD',
          scheduled_date: '',
          scheduled_time: '',
          field: '',
          status: 'scheduled',
          score_home: 0,
          score_away: 0,
          recorder: '',
        });

        brackets.push({
          tournamentId,
          round: roundName,
          matchNumber: i + 1,
          team1Id: 'TBD',
          team2Id: 'TBD',
          gameId,
        });
      }
    }

    // 3位決定戦を作成（準決勝が2試合ある場合のみ）
    if (bracketSize >= 4) {
      maxGameId++;
      const gameId = `GAME${String(maxGameId).padStart(3, '0')}`;

      await gamesSheet.addRow({
        game_id: gameId,
        tournament_id: tournamentId,
        game_type: 'tournament',
        round: '3位決定戦',
        team_home_id: 'TBD',
        team_away_id: 'TBD',
        scheduled_date: '',
        scheduled_time: '',
        field: '',
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        recorder: '',
      });

      brackets.push({
        tournamentId,
        round: '3位決定戦',
        matchNumber: 1,
        team1Id: 'TBD',
        team2Id: 'TBD',
        gameId,
      });
    }

    return brackets;
  } catch (error) {
    console.error('Error generating tournament bracket:', error);
    throw error;
  }
}

export async function getTournamentBracket(tournamentId: string): Promise<TournamentBracket[]> {
  try {
    const doc = await getSpreadsheet();
    const gamesSheet = doc.sheetsByTitle['Games'];
    if (!gamesSheet) {
      console.error('Games sheet not found');
      return [];
    }

    const rows = await gamesSheet.getRows();
    const tournamentGames = rows.filter(
      row =>
        row.get('tournament_id') === tournamentId &&
        row.get('game_type') === 'tournament'
    );

    // ラウンドの順序を定義
    const roundOrder: { [key: string]: number } = {
      '1回戦': 1,
      '2回戦': 2,
      '準々決勝': 3,
      '準決勝': 4,
      '3位決定戦': 5,
      '決勝': 6,
    };

    return tournamentGames
      .map(row => ({
        tournamentId: row.get('tournament_id'),
        round: row.get('round') || '1回戦',
        matchNumber: 0, // 後でソート順から計算
        team1Id: row.get('team_home_id'),
        team2Id: row.get('team_away_id'),
        winnerId: row.get('status') === 'completed'
          ? (parseInt(row.get('score_home') || '0') > parseInt(row.get('score_away') || '0')
            ? row.get('team_home_id')
            : row.get('team_away_id'))
          : undefined,
        score1: parseInt(row.get('score_home') || '0'),
        score2: parseInt(row.get('score_away') || '0'),
        gameId: row.get('game_id'),
      }))
      .sort((a, b) => {
        const orderA = roundOrder[a.round] || 0;
        const orderB = roundOrder[b.round] || 0;
        return orderA - orderB;
      })
      .map((bracket, index) => ({
        ...bracket,
        matchNumber: index + 1,
      }));
  } catch (error) {
    console.error('Error fetching tournament bracket:', error);
    return [];
  }
}

// ===== イニング管理 =====

export async function getInnings(gameId: string): Promise<Inning[]> {
  try {
    const doc = await getSpreadsheet();
    const inningsSheet = doc.sheetsByTitle['Innings'];
    if (!inningsSheet) {
      console.error('Innings sheet not found');
      return [];
    }

    const rows = await inningsSheet.getRows();
    return rows
      .filter(row => row.get('game_id') === gameId)
      .map(row => ({
        gameId: row.get('game_id'),
        inning: parseInt(row.get('inning')),
        homeScore: parseInt(row.get('home_score') || '0'),
        awayScore: parseInt(row.get('away_score') || '0'),
      }))
      .sort((a, b) => a.inning - b.inning);
  } catch (error) {
    console.error('Error fetching innings:', error);
    return [];
  }
}

export async function updateInning(inning: Inning): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const inningsSheet = doc.sheetsByTitle['Innings'];
    if (!inningsSheet) {
      throw new Error('Innings sheet not found');
    }

    const rows = await inningsSheet.getRows();
    const existingRow = rows.find(
      row => row.get('game_id') === inning.gameId && parseInt(row.get('inning')) === inning.inning
    );

    if (existingRow) {
      existingRow.set('home_score', inning.homeScore);
      existingRow.set('away_score', inning.awayScore);
      await existingRow.save();
    } else {
      await inningsSheet.addRow({
        game_id: inning.gameId,
        inning: inning.inning,
        home_score: inning.homeScore,
        away_score: inning.awayScore,
      });
    }

    // 試合の合計スコアを更新
    const innings = await getInnings(inning.gameId);
    const totalHomeScore = innings.reduce((sum, inn) => sum + inn.homeScore, 0);
    const totalAwayScore = innings.reduce((sum, inn) => sum + inn.awayScore, 0);

    const gamesSheet = doc.sheetsByTitle['Games'];
    if (gamesSheet) {
      const gameRows = await gamesSheet.getRows();
      const gameRow = gameRows.find(row => row.get('game_id') === inning.gameId);
      if (gameRow) {
        gameRow.set('score_home', totalHomeScore);
        gameRow.set('score_away', totalAwayScore);
        await gameRow.save();
      }
    }
  } catch (error) {
    console.error('Error updating inning:', error);
    throw error;
  }
}

export async function deleteInning(gameId: string, inningNumber: number): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const inningsSheet = doc.sheetsByTitle['Innings'];
    if (!inningsSheet) {
      throw new Error('Innings sheet not found');
    }

    const rows = await inningsSheet.getRows();
    const rowToDelete = rows.find(
      row => row.get('game_id') === gameId && parseInt(row.get('inning')) === inningNumber
    );

    if (rowToDelete) {
      await rowToDelete.delete();

      // 試合の合計スコアを更新
      const innings = await getInnings(gameId);
      const totalHomeScore = innings.reduce((sum, inn) => sum + inn.homeScore, 0);
      const totalAwayScore = innings.reduce((sum, inn) => sum + inn.awayScore, 0);

      const gamesSheet = doc.sheetsByTitle['Games'];
      if (gamesSheet) {
        const gameRows = await gamesSheet.getRows();
        const gameRow = gameRows.find(row => row.get('game_id') === gameId);
        if (gameRow) {
          gameRow.set('score_home', totalHomeScore);
          gameRow.set('score_away', totalAwayScore);
          await gameRow.save();
        }
      }
    }
  } catch (error) {
    console.error('Error deleting inning:', error);
    throw error;
  }
}

// ===== 打席記録管理 =====

export async function getAtBats(gameId: string): Promise<AtBat[]> {
  try {
    const doc = await getSpreadsheet();
    const atBatsSheet = doc.sheetsByTitle['AtBats'];
    if (!atBatsSheet) {
      console.error('AtBats sheet not found');
      return [];
    }

    const rows = await atBatsSheet.getRows();
    return rows
      .filter(row => row.get('game_id') === gameId)
      .map(row => ({
        gameId: row.get('game_id'),
        inning: parseInt(row.get('inning')),
        teamId: row.get('team_id'),
        playerId: row.get('player_id'),
        battingOrder: parseInt(row.get('batting_order')),
        result: row.get('result') as AtBatResult,
        bases: parseInt(row.get('bases') || '0'),
        isHomerun: row.get('is_homerun') === 'TRUE' || row.get('is_homerun') === true,
        rbi: parseInt(row.get('rbi') || '0'),
        notes: row.get('notes') || undefined,
      }))
      .sort((a, b) => a.inning - b.inning || a.battingOrder - b.battingOrder);
  } catch (error) {
    console.error('Error fetching at-bats:', error);
    return [];
  }
}

export async function addAtBat(atBat: AtBat): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const atBatsSheet = doc.sheetsByTitle['AtBats'];
    if (!atBatsSheet) {
      throw new Error('AtBats sheet not found');
    }

    await atBatsSheet.addRow({
      game_id: atBat.gameId,
      inning: atBat.inning,
      team_id: atBat.teamId,
      player_id: atBat.playerId,
      batting_order: atBat.battingOrder,
      result: atBat.result,
      bases: atBat.bases,
      is_homerun: atBat.isHomerun,
      rbi: atBat.rbi,
      notes: atBat.notes || '',
    });
  } catch (error) {
    console.error('Error adding at-bat:', error);
    throw error;
  }
}

export async function deleteAtBat(gameId: string, inning: number, playerId: string): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const atBatsSheet = doc.sheetsByTitle['AtBats'];
    if (!atBatsSheet) {
      throw new Error('AtBats sheet not found');
    }

    const rows = await atBatsSheet.getRows();
    const rowsToDelete = rows.filter(
      row =>
        row.get('game_id') === gameId &&
        parseInt(row.get('inning')) === inning &&
        row.get('player_id') === playerId
    );

    for (const row of rowsToDelete) {
      await row.delete();
    }
  } catch (error) {
    console.error('Error deleting at-bat:', error);
    throw error;
  }
}

export async function advanceTournamentWinner(
  tournamentId: string,
  completedGameId: string,
  winnerId: string
): Promise<void> {
  try {
    const doc = await getSpreadsheet();
    const gamesSheet = doc.sheetsByTitle['Games'];
    if (!gamesSheet) {
      throw new Error('Games sheet not found');
    }

    const rows = await gamesSheet.getRows();

    // 完了した試合を取得
    const completedGame = rows.find(row => row.get('game_id') === completedGameId);
    if (!completedGame) {
      throw new Error('Completed game not found');
    }

    const currentRound = completedGame.get('round');
    const homeTeamId = completedGame.get('team_home_id');
    const awayTeamId = completedGame.get('team_away_id');
    const loserId = homeTeamId === winnerId ? awayTeamId : homeTeamId;

    // 次のラウンドを決定
    const roundProgression: { [key: string]: string } = {
      '1回戦': '2回戦',
      '2回戦': '準々決勝',
      '準々決勝': '準決勝',
      '準決勝': '決勝',
    };

    const nextRound = roundProgression[currentRound];
    if (!nextRound) {
      // 決勝戦なので進出先なし
      return;
    }

    // 準決勝の場合は敗者を3位決定戦に進める
    if (currentRound === '準決勝') {
      const thirdPlaceGame = rows.find(
        row => row.get('tournament_id') === tournamentId && row.get('round') === '3位決定戦'
      );

      if (thirdPlaceGame) {
        const currentRoundGames = rows
          .filter(row => row.get('tournament_id') === tournamentId && row.get('round') === currentRound)
          .sort((a, b) => a.get('game_id').localeCompare(b.get('game_id')));

        const matchIndex = currentRoundGames.findIndex(row => row.get('game_id') === completedGameId);

        // 最初の準決勝の敗者をホーム、2番目の準決勝の敗者をアウェイに
        if (matchIndex === 0) {
          thirdPlaceGame.set('team_home_id', loserId);
        } else if (matchIndex === 1) {
          thirdPlaceGame.set('team_away_id', loserId);
        }

        await thirdPlaceGame.save();
      }
    }

    // 現在のラウンドの試合を取得して番号を計算
    const currentRoundGames = rows
      .filter(row => row.get('tournament_id') === tournamentId && row.get('round') === currentRound)
      .sort((a, b) => a.get('game_id').localeCompare(b.get('game_id')));

    const matchIndex = currentRoundGames.findIndex(row => row.get('game_id') === completedGameId);
    if (matchIndex === -1) {
      throw new Error('Could not find match index');
    }

    // 次のラウンドの試合番号を計算（0-indexed）
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const isHomeTeam = matchIndex % 2 === 0;

    // 次のラウンドの試合を検索
    const nextRoundGames = rows.filter(
      row => row.get('tournament_id') === tournamentId && row.get('round') === nextRound
    );

    let nextGame;
    if (nextMatchIndex < nextRoundGames.length) {
      // 既存の試合を更新
      nextGame = nextRoundGames.sort((a, b) => a.get('game_id').localeCompare(b.get('game_id')))[nextMatchIndex];
    } else {
      // 次のラウンドの試合がまだ存在しない場合は作成
      const gameIds = rows
        .map(row => {
          const id = row.get('game_id');
          if (id && id.startsWith('GAME')) {
            return parseInt(id.substring(4));
          }
          return 0;
        })
        .filter(id => !isNaN(id));

      const maxGameId = gameIds.length > 0 ? Math.max(...gameIds) : 0;
      const newGameId = `GAME${String(maxGameId + 1).padStart(3, '0')}`;

      // 新しい試合を作成
      await gamesSheet.addRow({
        game_id: newGameId,
        tournament_id: tournamentId,
        game_type: 'tournament',
        round: nextRound,
        team_home_id: isHomeTeam ? winnerId : 'TBD',
        team_away_id: isHomeTeam ? 'TBD' : winnerId,
        scheduled_date: '',
        scheduled_time: '',
        field: '',
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        recorder: '',
      });

      console.log(`Created new game ${newGameId} in ${nextRound} with winner ${winnerId}`);
      return;
    }

    // 既存の試合を更新
    if (isHomeTeam) {
      nextGame.set('team_home_id', winnerId);
    } else {
      nextGame.set('team_away_id', winnerId);
    }

    await nextGame.save();
    console.log(`Advanced winner ${winnerId} to ${nextRound} game ${nextGame.get('game_id')}`);

  } catch (error) {
    console.error('Error advancing tournament winner:', error);
    throw error;
  }
}
