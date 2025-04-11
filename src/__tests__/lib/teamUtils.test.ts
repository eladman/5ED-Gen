import { getTeamById, getTeamNameById, getTeamType, getTeamAge, teams } from '@/lib/teamUtils';

describe('Team Utilities', () => {
  describe('getTeamById', () => {
    it('should return a team when valid ID is provided', () => {
      const team = getTeamById('85074');
      expect(team).toBeDefined();
      expect(team?.name).toBe('הוד השרון נוער בנים (יא-יב)');
      expect(team?.age).toBe('נוער');
    });

    it('should return undefined when invalid ID is provided', () => {
      const team = getTeamById('invalid-id');
      expect(team).toBeUndefined();
    });
  });

  describe('getTeamNameById', () => {
    it('should return team name when valid ID is provided', () => {
      const teamName = getTeamNameById('85074');
      expect(teamName).toBe('הוד השרון נוער בנים (יא-יב)');
    });

    it('should return empty string when invalid ID is provided', () => {
      const teamName = getTeamNameById('invalid-id');
      expect(teamName).toBe('');
    });
  });

  describe('getTeamType', () => {
    it('should return נוער for teams with נוער in the name', () => {
      const teamType = getTeamType('הוד השרון נוער בנים (יא-יב)');
      expect(teamType).toBe('נוער');
    });

    it('should return נערים for teams with נערים in the name', () => {
      const teamType = getTeamType('עמק חפר מערב נערים (ט-י)');
      expect(teamType).toBe('נערים');
    });

    it('should return ילדים for teams with ילדים in the name', () => {
      const teamType = getTeamType('רעננה ילדים (ו-ז)');
      expect(teamType).toBe('ילדים');
    });

    it('should return נוער for special teams', () => {
      const teamType = getTeamType('צוות - מאמנים');
      expect(teamType).toBe('נוער');
    });

    it('should return empty string for unknown team names', () => {
      const teamType = getTeamType('unknown team');
      expect(teamType).toBe('');
    });
  });

  describe('getTeamAge', () => {
    it('should return the age category when valid ID is provided', () => {
      const age = getTeamAge('85074');
      expect(age).toBe('נוער');
    });

    it('should return empty string when invalid ID is provided', () => {
      const age = getTeamAge('invalid-id');
      expect(age).toBe('');
    });
  });

  describe('teams data structure', () => {
    it('should contain all required teams', () => {
      expect(teams.length).toBeGreaterThan(30); // Assuming we have at least 30 teams
      
      // Check a few specific teams exist
      const hodHasharonTeam = teams.find(team => team.id === '85074');
      expect(hodHasharonTeam).toBeDefined();
      expect(hodHasharonTeam?.name).toBe('הוד השרון נוער בנים (יא-יב)');
      
      const raananaTeam = teams.find(team => team.id === '83454');
      expect(raananaTeam).toBeDefined();
      expect(raananaTeam?.name).toBe('רעננה נוער בנים (יא-יב)');
    });

    it('should have valid team data structure', () => {
      teams.forEach(team => {
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('name');
        expect(team).toHaveProperty('age');
        expect(typeof team.id).toBe('string');
        expect(typeof team.name).toBe('string');
        expect(typeof team.age).toBe('string');
      });
    });
  });
}); 