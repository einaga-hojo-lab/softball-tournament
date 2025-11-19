import { GoogleSpreadsheet } from 'google-spreadsheet';
import { Game, Team, Player, Tournament, LeagueStanding, PlayerStats } from './types';

// Google Sheetsドキュメントの取得
export async function getSpreadsheet() {
  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID!,
    {
      apiKey: process.env.GOOGLE_API_KEY,
    }
  );

  // サービスアカウント認証を使用する場合
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  await doc.loadInfo();
  return doc;
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
