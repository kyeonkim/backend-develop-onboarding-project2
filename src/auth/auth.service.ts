import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/signIn.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
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

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    // 사용자 조회
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 토큰 생성
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
}
