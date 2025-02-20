import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';

@Injectable()
export class JwtVerificationService {
  private jwkSetUri: string;
  private issuerUri: string;
   private logger = new Logger(JwtVerificationService.name);
  constructor(configService: ConfigService) {
    this.jwkSetUri = process.env.JWK_SET_URI ?? "";//configService.getOrThrow<string>('JWK_SET_URI')
    this.issuerUri = process.env.ISSUER_URI ?? "";//configService.getOrThrow<string>('ISSUER_URI')
    this.logger.verbose(this.issuerUri);
    this.logger.verbose(this.jwkSetUri);
  }

  async verify(token: string) {
    try {
      const JWKS = jose.createRemoteJWKSet(new URL(this.jwkSetUri));
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: this.issuerUri,
      });
      return payload;
    } catch (e) {
      throw e;
    }
  }
}
