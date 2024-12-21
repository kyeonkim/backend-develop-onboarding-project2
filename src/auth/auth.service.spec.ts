import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({}),
        JwtModule.register({}),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should generate an access token', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = service.generateAccessToken(payload);

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should generate a refresh token', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = service.generateRefreshToken(payload);

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });
});
