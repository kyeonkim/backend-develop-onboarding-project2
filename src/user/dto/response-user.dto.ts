/* eslint-disable prettier/prettier */
import { User } from '../domain/user.entity';

export class ResponseUserDto {
  username: string;
  nickname: string;
  authorities: { authorityName: string }[];

  static fromEntity(user: User): ResponseUserDto {
    return {
      username: user.username,
      nickname: user.nickname,
      authorities: [{ authorityName: user.role }],
    };
  }
}
