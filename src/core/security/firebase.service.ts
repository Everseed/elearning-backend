import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  private auth: Auth;
  private apiKey: string;
  private logger = new Logger(FirebaseService.name);

  constructor(configService: ConfigService) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ?? "";
    this.logger.verbose(serviceAccount);
    /* configService.getOrThrow<string>(
      'FIREBASE_SERVICE_ACCOUNT',
    ); */

    this.apiKey = process.env.FIREBASE_API_KEY ?? "";
    this.logger.verbose(this.apiKey);
    /* configService.getOrThrow<string>('FIREBASE_API_KEY'); */

    const app = initializeApp({
      credential: cert(serviceAccount),
    });

    this.auth = getAuth(app);
  }

  async getUser(uid: string) {
    try {
      return await this.auth.getUser(uid);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  async verifyEmail(oobCode: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${this.apiKey}`;
    const body = {
      oobCode,
    };

    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await resp.json();

    if (!resp.ok) {
      const message = json['error']['message'];
      throw new BadRequestException(message);
    }

    const uid = json['localId'];
    const emailVerified = json['emailVerified'];

    return { uid, emailVerified };
  }
}
