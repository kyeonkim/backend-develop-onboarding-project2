import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: object): string {
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    return this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: '1m',
    });
  }

  generateRefreshToken(payload: object): string {
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    return this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: '1h',
    });
  }
}
