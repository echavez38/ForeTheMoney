import type { User } from '@shared/schema';

export interface GHINPlayer {
  ghinNumber: string;
  firstName: string;
  lastName: string;
  handicapIndex: number;
  club: string;
  homeClub: string;
  isActive: boolean;
  lastUpdated: string;
}

export interface HandicapVerificationResult {
  isValid: boolean;
  officialHandicap?: number;
  lastUpdated?: string;
  errorMessage?: string;
  requiresUpdate?: boolean;
}

export class GHINService {
  private apiKey: string | undefined;
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private baseUrl = 'https://api.ghin.com/api/v1';

  constructor() {
    this.apiKey = process.env.GHIN_API_KEY;
    this.clientId = process.env.GHIN_CLIENT_ID;
    this.clientSecret = process.env.GHIN_CLIENT_SECRET;
  }

  private get isConfigured(): boolean {
    return !!(this.apiKey && this.clientId && this.clientSecret);
  }

  async verifyHandicap(ghinNumber: string, declaredHandicap: number): Promise<HandicapVerificationResult> {
    if (!this.isConfigured) {
      console.log('GHIN API no configurado - usando verificación local');
      return this.localHandicapVerification(declaredHandicap);
    }

    try {
      const playerData = await this.getPlayerData(ghinNumber);
      
      if (!playerData) {
        return {
          isValid: false,
          errorMessage: 'Número GHIN no encontrado en el sistema oficial'
        };
      }

      const handicapDifference = Math.abs(playerData.handicapIndex - declaredHandicap);
      
      // Permitir una diferencia mínima debido a actualizaciones
      if (handicapDifference <= 1) {
        return {
          isValid: true,
          officialHandicap: playerData.handicapIndex,
          lastUpdated: playerData.lastUpdated
        };
      } else {
        return {
          isValid: false,
          officialHandicap: playerData.handicapIndex,
          requiresUpdate: true,
          errorMessage: `Handicap declarado (${declaredHandicap}) no coincide con el oficial (${playerData.handicapIndex})`
        };
      }
    } catch (error) {
      console.error('Error verificando handicap GHIN:', error);
      return {
        isValid: false,
        errorMessage: 'Error conectando con el sistema GHIN. Inténtalo más tarde.'
      };
    }
  }

  private async getPlayerData(ghinNumber: string): Promise<GHINPlayer | null> {
    if (!this.isConfigured) return null;

    try {
      const response = await fetch(`${this.baseUrl}/players/${ghinNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-ID': this.clientId!,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Player not found
        }
        throw new Error(`GHIN API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        ghinNumber: data.ghin_number,
        firstName: data.first_name,
        lastName: data.last_name,
        handicapIndex: data.handicap_index,
        club: data.club_name,
        homeClub: data.home_club,
        isActive: data.is_active,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('Error fetching GHIN player data:', error);
      throw error;
    }
  }

  async searchPlayer(firstName: string, lastName: string): Promise<GHINPlayer[]> {
    if (!this.isConfigured) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/players/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-ID': this.clientId!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName
        })
      });

      if (!response.ok) {
        throw new Error(`GHIN API error: ${response.status}`);
      }

      const data = await response.json();
      return data.players || [];
    } catch (error) {
      console.error('Error searching GHIN players:', error);
      return [];
    }
  }

  private localHandicapVerification(declaredHandicap: number): HandicapVerificationResult {
    // Verificación local básica cuando GHIN no está disponible
    if (declaredHandicap < 0 || declaredHandicap > 54) {
      return {
        isValid: false,
        errorMessage: 'Handicap debe estar entre 0 y 54'
      };
    }

    // Por ahora aceptamos el handicap declarado con advertencia
    return {
      isValid: true,
      errorMessage: 'Handicap no verificado con GHIN - verificación pendiente'
    };
  }

  async updateHandicapFromGHIN(ghinNumber: string): Promise<number | null> {
    const playerData = await this.getPlayerData(ghinNumber);
    return playerData ? playerData.handicapIndex : null;
  }

  getVerificationStatus(): { configured: boolean; message: string } {
    if (this.isConfigured) {
      return {
        configured: true,
        message: 'GHIN API configurado y listo'
      };
    } else {
      return {
        configured: false,
        message: 'GHIN API no configurado - usando verificación local'
      };
    }
  }
}

export const ghinService = new GHINService();